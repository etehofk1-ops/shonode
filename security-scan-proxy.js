const dns = require("node:dns/promises");
const net = require("node:net");
const { spawnSync } = require("node:child_process");
const { sendJson } = require("./storyboard-proxy");

const MAX_BODY_BYTES = 16 * 1024;
const FETCH_TIMEOUT_MS = 12_000;
const MAX_REDIRECTS = 5;
const MAX_HTML_CHARS = 500_000;
const SCAN_USER_AGENT = "Shonode-Security-Scanner/0.1";
const SEVERITY_RANK = {
  high: 0,
  medium: 1,
  low: 2,
  info: 3
};

async function handleSecurityScan(request, response) {
  const originPolicy = getOriginPolicy(request);
  setCorsHeaders(response, originPolicy.allowOrigin);

  if (request.method === "OPTIONS") {
    response.statusCode = originPolicy.allowed ? 204 : 403;
    response.end();
    return;
  }

  if (!originPolicy.allowed) {
    sendJson(response, 403, {
      error: "Origin not allowed.",
      hint: "Use the security scanner from the same origin as this API."
    });
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  const requesterIsLocal = isLocalRequest(request);
  const tokenValidation = validateScanToken(request, requesterIsLocal);
  if (!tokenValidation.allowed) {
    sendJson(response, 403, {
      error: "Security scan is locked.",
      hint: tokenValidation.hint
    });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request, MAX_BODY_BYTES);
  } catch (error) {
    sendJson(response, 400, { error: error.message || "Invalid JSON body." });
    return;
  }

  let targetUrl;
  try {
    targetUrl = normalizeTargetUrl(body?.url);
  } catch (error) {
    sendJson(response, 400, { error: error.message || "Invalid target URL." });
    return;
  }

  const targetSafety = await inspectTargetSafety(targetUrl);
  if (targetSafety.privateTarget && !requesterIsLocal && !allowsPrivateTargets()) {
    sendJson(response, 400, {
      error: "Private network targets are blocked.",
      hint: "Run the scanner locally for localhost/private URLs or set SHONODE_ALLOW_PRIVATE_SECURITY_SCAN=1 for trusted environments."
    });
    return;
  }

  try {
    const report = await runPassiveScan(targetUrl, {
      blockPrivate: !requesterIsLocal && !allowsPrivateTargets()
    });
    sendJson(response, 200, {
      ...report,
      access: {
        requesterIsLocal,
        privateTarget: targetSafety.privateTarget,
        privateTargetReason: targetSafety.reason || "",
        tokenProtected: Boolean(process.env.SHONODE_SECURITY_SCAN_TOKEN)
      },
      shannon: getShannonGuidance(report.meta.finalUrl || targetUrl.toString())
    });
  } catch (error) {
    sendJson(response, 502, {
      error: "Failed to complete passive scan.",
      details: error.message || "Unknown fetch error."
    });
  }
}

function getOriginPolicy(request) {
  const origin = getHeaderValue(request.headers?.origin);
  const requestOrigin = inferRequestOrigin(request);
  const allowedOrigins = new Set(parseAllowedOrigins(process.env.SHONODE_ALLOWED_ORIGINS));

  if (requestOrigin) {
    allowedOrigins.add(requestOrigin);
  }

  const allowMissingOrigin = !process.env.VERCEL;
  if (!origin) {
    return {
      allowed: allowMissingOrigin,
      allowOrigin: requestOrigin || Array.from(allowedOrigins)[0] || ""
    };
  }

  return {
    allowed: allowedOrigins.has(origin),
    allowOrigin: origin
  };
}

function inferRequestOrigin(request) {
  const host = getHeaderValue(request.headers?.["x-forwarded-host"]) || getHeaderValue(request.headers?.host);
  if (!host) {
    return "";
  }

  const forwardedProto = getHeaderValue(request.headers?.["x-forwarded-proto"]);
  const protocol = forwardedProto || (isLoopbackHost(host.split(":")[0]) ? "http" : "https");
  return `${protocol}://${host}`;
}

function setCorsHeaders(response, allowOrigin) {
  if (allowOrigin) {
    response.setHeader("Access-Control-Allow-Origin", allowOrigin);
    response.setHeader("Vary", "Origin");
  }

  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Scan-Token");
}

function validateScanToken(request, requesterIsLocal) {
  if (requesterIsLocal) {
    return { allowed: true };
  }

  const expectedToken = process.env.SHONODE_SECURITY_SCAN_TOKEN;
  if (!expectedToken) {
    return {
      allowed: false,
      hint: "Set SHONODE_SECURITY_SCAN_TOKEN to protect public deployments, or run this page locally."
    };
  }

  const receivedToken = getHeaderValue(request.headers?.["x-scan-token"]);
  if (receivedToken && receivedToken === expectedToken) {
    return { allowed: true };
  }

  return {
    allowed: false,
    hint: "Provide the correct scan token to run scans from a deployed environment."
  };
}

function isLocalRequest(request) {
  const host = (getHeaderValue(request.headers?.host) || "").split(":")[0];
  const forwardedFor = getHeaderValue(request.headers?.["x-forwarded-for"]).split(",")[0].trim();
  const remoteAddress = request.socket?.remoteAddress || "";

  return [host, forwardedFor, remoteAddress].some((value) => isLoopbackHost(value));
}

function isLoopbackHost(value) {
  const normalized = (value || "").replace(/^\[|\]$/g, "").toLowerCase();
  if (!normalized) {
    return false;
  }

  return normalized === "localhost"
    || normalized === "::1"
    || normalized === "127.0.0.1"
    || normalized.startsWith("127.")
    || normalized === "::ffff:127.0.0.1";
}

async function readJsonBody(request, maxBytes) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  if (typeof request.body === "string") {
    return request.body ? JSON.parse(request.body) : {};
  }

  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;

    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("Request body too large."));
        request.destroy();
        return;
      }

      body += chunk.toString("utf8");
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error(`JSON parse failed: ${error.message}`));
      }
    });

    request.on("error", (error) => {
      reject(error);
    });
  });
}

function normalizeTargetUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Enter a URL to scan.");
  }

  const targetUrl = new URL(value.trim());
  if (!["http:", "https:"].includes(targetUrl.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }

  return targetUrl;
}

async function inspectTargetSafety(targetUrl) {
  const hostname = targetUrl.hostname;
  if (isPrivateTarget(hostname)) {
    return {
      privateTarget: true,
      reason: "Literal localhost or private IP target."
    };
  }

  try {
    const addresses = await dns.lookup(hostname, { all: true, verbatim: true });
    const privateAddress = addresses.find((entry) => isPrivateTarget(entry.address));
    if (privateAddress) {
      return {
        privateTarget: true,
        reason: `Resolved to private address ${privateAddress.address}.`
      };
    }
  } catch {
    return {
      privateTarget: false,
      reason: ""
    };
  }

  return {
    privateTarget: false,
    reason: ""
  };
}

function isPrivateTarget(value) {
  const normalized = (value || "").replace(/^\[|\]$/g, "").toLowerCase();
  if (!normalized) {
    return false;
  }

  if (normalized === "localhost" || normalized.endsWith(".local")) {
    return true;
  }

  const ipVersion = net.isIP(normalized);
  if (ipVersion === 4) {
    return isPrivateIpv4(normalized);
  }

  if (ipVersion === 6) {
    return isPrivateIpv6(normalized);
  }

  return false;
}

function isPrivateIpv4(address) {
  const parts = address.split(".").map((value) => Number.parseInt(value, 10));
  if (parts.length !== 4 || parts.some((value) => Number.isNaN(value))) {
    return false;
  }

  const [first, second] = parts;
  return first === 10
    || first === 127
    || (first === 169 && second === 254)
    || (first === 172 && second >= 16 && second <= 31)
    || (first === 192 && second === 168)
    || first === 0;
}

function isPrivateIpv6(address) {
  const normalized = address.toLowerCase();
  return normalized === "::1"
    || normalized.startsWith("fc")
    || normalized.startsWith("fd")
    || normalized.startsWith("fe8")
    || normalized.startsWith("fe9")
    || normalized.startsWith("fea")
    || normalized.startsWith("feb");
}

function allowsPrivateTargets() {
  return process.env.SHONODE_ALLOW_PRIVATE_SECURITY_SCAN === "1";
}

async function runPassiveScan(targetUrl, options = {}) {
  const startedAt = Date.now();
  const blockPrivate = Boolean(options.blockPrivate);

  // Follow redirects manually so every hop is re-validated. Native redirect:"follow"
  // would let a public URL bounce to http://169.254.169.254/ or a private IP after the
  // initial host check, which is a classic SSRF bypass.
  let currentUrl = targetUrl;
  let upstreamResponse;
  let redirectCount = 0;

  while (true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let hopResponse;
    try {
      hopResponse = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "user-agent": SCAN_USER_AGENT,
          accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8"
        }
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!isRedirectStatus(hopResponse.status) || !hopResponse.headers.get("location")) {
      upstreamResponse = hopResponse;
      break;
    }

    if (redirectCount >= MAX_REDIRECTS) {
      throw new Error("Too many redirects while scanning.");
    }
    redirectCount += 1;

    let nextUrl;
    try {
      nextUrl = new URL(hopResponse.headers.get("location"), currentUrl);
    } catch {
      throw new Error("Redirect target is not a valid URL.");
    }

    if (!["http:", "https:"].includes(nextUrl.protocol)) {
      throw new Error("Redirect to a non-http(s) target was blocked.");
    }

    if (blockPrivate) {
      const hopSafety = await inspectTargetSafety(nextUrl);
      if (hopSafety.privateTarget) {
        throw new Error("Redirect to a private-network target was blocked.");
      }
    }

    currentUrl = nextUrl;
  }

  const finalUrl = new URL(upstreamResponse.url || targetUrl.toString());
  const headers = headersToObject(upstreamResponse.headers);
  const contentType = upstreamResponse.headers.get("content-type") || "";
  const shouldReadHtml = isLikelyHtmlContent(contentType, finalUrl.pathname);
  const bodyText = shouldReadHtml ? (await upstreamResponse.text()).slice(0, MAX_HTML_CHARS) : "";

  const findings = [];
  analyzeTransport(findings, targetUrl, finalUrl, bodyText);
  analyzeSecurityHeaders(findings, upstreamResponse.headers, finalUrl);
  analyzeCors(findings, upstreamResponse.headers, contentType);
  analyzeCookies(findings, upstreamResponse.headers, finalUrl);
  analyzeHtml(findings, bodyText, finalUrl, upstreamResponse.headers.get("content-security-policy") || "");

  findings.sort((left, right) => SEVERITY_RANK[left.severity] - SEVERITY_RANK[right.severity]);

  return {
    meta: {
      scannedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      inputUrl: targetUrl.toString(),
      finalUrl: finalUrl.toString(),
      status: upstreamResponse.status,
      ok: upstreamResponse.ok,
      contentType
    },
    summary: {
      score: calculateScore(findings),
      totalFindings: findings.length,
      severities: summarizeSeverities(findings)
    },
    findings,
    headers
  };
}

function isRedirectStatus(status) {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

function isLikelyHtmlContent(contentType, pathname) {
  if (contentType.includes("text/html") || contentType.includes("application/xhtml+xml")) {
    return true;
  }

  return !/\.(?:png|jpe?g|webp|gif|svg|pdf|zip|mp4|mov|webm|json)$/i.test(pathname || "");
}

function analyzeTransport(findings, inputUrl, finalUrl, html) {
  const finalIsLocal = isPrivateTarget(finalUrl.hostname);
  if (finalUrl.protocol !== "https:" && !finalIsLocal) {
    pushFinding(findings, "high", "HTTPS is not enforced", "The scanned page finished on plain HTTP.", "Serve the application over HTTPS and redirect HTTP traffic to HTTPS.", finalUrl.toString());
  }

  if (inputUrl.protocol === "http:" && finalUrl.protocol === "https:") {
    pushFinding(findings, "info", "HTTP request upgraded to HTTPS", "The target redirected to HTTPS, which is good, but HSTS should still be enabled.", "Add Strict-Transport-Security so browsers refuse future insecure requests.", `${inputUrl.toString()} -> ${finalUrl.toString()}`);
  }

  if (html && finalUrl.protocol !== "https:" && /<input\b[^>]*type=["']password["']/i.test(html)) {
    pushFinding(findings, "high", "Password field served without HTTPS", "A password input was found on a non-HTTPS page.", "Protect login and sensitive forms with HTTPS before collecting credentials.", "Found <input type=\"password\"> on a non-HTTPS page.");
  }
}

function analyzeSecurityHeaders(findings, headers, finalUrl) {
  const csp = headers.get("content-security-policy") || "";
  const hsts = headers.get("strict-transport-security") || "";
  const xFrameOptions = headers.get("x-frame-options") || "";
  const xContentTypeOptions = headers.get("x-content-type-options") || "";
  const referrerPolicy = headers.get("referrer-policy") || "";
  const permissionsPolicy = headers.get("permissions-policy") || "";
  const serverHeader = headers.get("server") || "";
  const poweredBy = headers.get("x-powered-by") || "";

  if (finalUrl.protocol === "https:" && !hsts) {
    pushFinding(findings, "medium", "HSTS header is missing", "HTTPS is in use, but the site does not tell browsers to refuse future HTTP downgrades.", "Add Strict-Transport-Security with an appropriate max-age and includeSubDomains where possible.", "Missing Strict-Transport-Security header.");
  }

  if (!csp) {
    pushFinding(findings, "medium", "Content Security Policy is missing", "Without CSP, XSS impact is higher and inline scripts are harder to control.", "Add a Content-Security-Policy header and move toward nonce or hash based scripts.", "Missing Content-Security-Policy header.");
  } else {
    if (/\bunsafe-inline\b/i.test(csp)) {
      pushFinding(findings, "medium", "CSP allows unsafe-inline", "The current CSP still permits inline script execution.", "Replace unsafe-inline with nonces or hashes to reduce XSS exposure.", csp);
    }

    if (/\bunsafe-eval\b/i.test(csp)) {
      pushFinding(findings, "medium", "CSP allows unsafe-eval", "The CSP allows eval-like execution, which weakens script protections.", "Remove unsafe-eval unless a specific dependency absolutely requires it.", csp);
    }
  }

  if (!xFrameOptions && !/\bframe-ancestors\b/i.test(csp)) {
    pushFinding(findings, "medium", "Clickjacking protection is missing", "The response does not define X-Frame-Options or CSP frame-ancestors.", "Block framing with frame-ancestors 'none' or a strict allowlist.", "Missing X-Frame-Options and frame-ancestors.");
  }

  if (xContentTypeOptions.toLowerCase() !== "nosniff") {
    pushFinding(findings, "low", "nosniff header is missing", "Browsers are not instructed to block MIME type sniffing.", "Add X-Content-Type-Options: nosniff.", xContentTypeOptions || "Missing X-Content-Type-Options header.");
  }

  if (!referrerPolicy) {
    pushFinding(findings, "low", "Referrer-Policy is missing", "Navigation may leak more URL data than intended.", "Add a referrer policy such as strict-origin-when-cross-origin.", "Missing Referrer-Policy header.");
  }

  if (!permissionsPolicy) {
    pushFinding(findings, "low", "Permissions-Policy is missing", "Browser features are not explicitly restricted.", "Add Permissions-Policy to deny unneeded capabilities like camera, microphone, and geolocation.", "Missing Permissions-Policy header.");
  }

  if (serverHeader) {
    pushFinding(findings, "low", "Server banner is exposed", "The response leaks server product information.", "Trim or remove the Server header where possible.", `Server: ${serverHeader}`);
  }

  if (poweredBy) {
    pushFinding(findings, "low", "X-Powered-By is exposed", "The response discloses framework information.", "Remove or override X-Powered-By in production.", `X-Powered-By: ${poweredBy}`);
  }
}

function analyzeCors(findings, headers, contentType) {
  const allowOrigin = headers.get("access-control-allow-origin") || "";
  const allowCredentials = headers.get("access-control-allow-credentials") || "";

  if (allowOrigin === "*" && allowCredentials.toLowerCase() === "true") {
    pushFinding(findings, "high", "CORS is misconfigured", "The response combines wildcard origin access with credentials.", "Return a specific trusted origin instead of * when credentials are involved.", "Access-Control-Allow-Origin: * with Access-Control-Allow-Credentials: true");
    return;
  }

  if (allowOrigin === "*" && /application\/json|text\/plain/i.test(contentType)) {
    pushFinding(findings, "low", "Response is readable cross-origin", "Wildcard CORS is enabled for a response that could expose data to other origins.", "Narrow Access-Control-Allow-Origin to trusted origins.", `Access-Control-Allow-Origin: * (${contentType || "unknown content type"})`);
  }
}

function analyzeCookies(findings, headers, finalUrl) {
  const cookieHeaders = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];

  cookieHeaders.forEach((cookieValue) => {
    const parts = cookieValue.split(";").map((segment) => segment.trim()).filter(Boolean);
    if (parts.length === 0) {
      return;
    }

    const [nameValue, ...attributes] = parts;
    const cookieName = nameValue.split("=")[0] || "cookie";
    const attributesLower = attributes.map((attribute) => attribute.toLowerCase());
    const isSensitiveCookie = /(session|auth|token|jwt|sid)/i.test(cookieName);

    if (finalUrl.protocol === "https:" && !attributesLower.includes("secure")) {
      pushFinding(findings, isSensitiveCookie ? "medium" : "low", "Cookie missing Secure flag", "A cookie is set without the Secure attribute on an HTTPS page.", "Set Secure on cookies that should never travel over HTTP.", cookieName);
    }

    if (isSensitiveCookie && !attributesLower.includes("httponly")) {
      pushFinding(findings, "medium", "Sensitive cookie missing HttpOnly", "A likely session or auth cookie is readable from JavaScript.", "Set HttpOnly on session and authentication cookies.", cookieName);
    }

    if (isSensitiveCookie && !attributesLower.some((attribute) => attribute.startsWith("samesite="))) {
      pushFinding(findings, "low", "Sensitive cookie missing SameSite", "A likely session or auth cookie does not declare SameSite.", "Add SameSite=Lax or SameSite=Strict unless cross-site flows require otherwise.", cookieName);
    }
  });
}

function analyzeHtml(findings, html, finalUrl, csp) {
  if (!html) {
    return;
  }

  const inlineScriptCount = (html.match(/<script\b(?![^>]*\bsrc=)[^>]*>/gi) || []).length;
  if (inlineScriptCount > 0 && !csp) {
    pushFinding(findings, "low", "Inline scripts increase XSS blast radius", "Inline scripts were detected while CSP is missing.", "Move inline scripts into separate files and add a restrictive CSP.", `${inlineScriptCount} inline script block(s) detected.`);
  }

  const mixedContentMatches = html.match(/<(?:script|img|iframe|link)\b[^>]*(?:src|href)=["']http:\/\/[^"']+/gi) || [];
  if (finalUrl.protocol === "https:" && mixedContentMatches.length > 0) {
    pushFinding(findings, "medium", "Potential mixed content references found", "The page appears to request HTTP assets from an HTTPS page.", "Upgrade all asset URLs to HTTPS or use protocol-relative handling with care.", mixedContentMatches.slice(0, 3).join("\n"));
  }

  const targetBlankMatches = html.match(/<a\b[^>]*target=["']_blank["'][^>]*>/gi) || [];
  const unsafeTargetBlankCount = targetBlankMatches.filter((tag) => !/\brel=["'][^"']*(noopener|noreferrer)/i.test(tag)).length;
  if (unsafeTargetBlankCount > 0) {
    pushFinding(findings, "low", "target=_blank links missing rel protection", "Some links open a new tab without noopener or noreferrer.", "Add rel=\"noopener noreferrer\" to external target=_blank links.", `${unsafeTargetBlankCount} target=_blank link(s) missing rel protection.`);
  }

  const postForms = Array.from(html.matchAll(/<form\b[^>]*\bmethod=["']?post["']?[^>]*>([\s\S]*?)<\/form>/gi));
  const csrflessForms = postForms.filter((match) => !/name=["'][^"']*(csrf|token|authenticity)[^"']*["']/i.test(match[1]));
  if (csrflessForms.length > 0) {
    pushFinding(findings, "medium", "POST form without obvious CSRF token", "A POST form was found without a hidden token-like input. This is heuristic and should be confirmed in the app flow.", "Verify CSRF defenses for state-changing forms, especially if cookie auth is used.", `${csrflessForms.length} POST form(s) lacked an obvious token field.`);
  }

  if (/\b(?:eval|new Function)\s*\(/i.test(html)) {
    pushFinding(findings, "medium", "Dynamic script execution pattern found", "The response body includes eval-like script execution patterns.", "Avoid eval/new Function in client code whenever possible.", "Found eval(...) or new Function(...).");
  }
}

function pushFinding(findings, severity, title, summary, recommendation, evidence) {
  findings.push({ severity, title, summary, recommendation, evidence });
}

function summarizeSeverities(findings) {
  return findings.reduce((counts, finding) => {
    counts[finding.severity] += 1;
    return counts;
  }, { high: 0, medium: 0, low: 0, info: 0 });
}

function calculateScore(findings) {
  const score = findings.reduce((value, finding) => {
    if (finding.severity === "high") return value - 20;
    if (finding.severity === "medium") return value - 10;
    if (finding.severity === "low") return value - 4;
    return value - 1;
  }, 100);

  return Math.max(0, score);
}

function headersToObject(headers) {
  const result = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

function getShannonGuidance(targetUrl) {
  const dockerInstalled = isCommandAvailable("docker", ["--version"]);
  const providerState = detectProviderState();

  return {
    available: dockerInstalled && providerState.ready,
    dockerInstalled,
    provider: providerState.provider,
    hint: dockerInstalled && providerState.ready
      ? "Shannon prerequisites look present on this machine."
      : "Shannon active scans still require Docker and a supported AI provider configuration.",
    command: `npx @keygraph/shannon start -u ${targetUrl} -r <repo-path>`
  };
}

function detectProviderState() {
  if (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_CODE_OAUTH_TOKEN) {
    return { ready: true, provider: "anthropic" };
  }

  if (process.env.CLAUDE_CODE_USE_BEDROCK === "1" && process.env.AWS_ACCESS_KEY_ID) {
    return { ready: true, provider: "bedrock" };
  }

  if (process.env.CLAUDE_CODE_USE_VERTEX === "1" && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return { ready: true, provider: "vertex" };
  }

  if (process.env.ROUTER_DEFAULT && (process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY)) {
    return { ready: true, provider: "router" };
  }

  return { ready: false, provider: "" };
}

function isCommandAvailable(command, args) {
  try {
    const result = spawnSync(command, args, { stdio: "pipe" });
    return result.status === 0;
  } catch {
    return false;
  }
}

function parseAllowedOrigins(value) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function getHeaderValue(value) {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : "";
  }

  return typeof value === "string" ? value : "";
}

module.exports = {
  handleSecurityScan
};
