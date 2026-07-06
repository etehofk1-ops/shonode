const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_KEY_ENV = "GEMINI_API_KEY";
const DEFAULT_ALLOWED_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const MAX_BODY_BYTES = 6 * 1024 * 1024;
const MAX_CONTENTS = 4;
const MAX_PARTS_PER_CONTENT = 24;
const MAX_TEXT_LENGTH = 20_000;
const MAX_INLINE_DATA_LENGTH = 2 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = Number.parseInt(process.env.SHONODE_RATE_LIMIT_PER_MINUTE || "20", 10);
const rateLimitBuckets = new Map();

async function handleStoryboardProxy(request, response, options = {}) {
  const originPolicy = getOriginPolicy(request, options);
  setCorsHeaders(response, originPolicy.allowOrigin);

  if (request.method === "OPTIONS") {
    response.statusCode = originPolicy.allowed ? 204 : 403;
    response.end();
    return;
  }

  if (!originPolicy.allowed) {
    sendJson(response, 403, {
      error: "Origin not allowed.",
      hint: "Use the Shonode app from the same origin as this API."
    });
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  const rateLimitResult = checkRateLimit(getClientAddress(request), options);
  if (!rateLimitResult.allowed) {
    response.setHeader("Retry-After", String(rateLimitResult.retryAfterSeconds));
    sendJson(response, 429, {
      error: "Rate limit exceeded.",
      hint: "Wait before sending another storyboard generation request."
    });
    return;
  }

  const apiKey = process.env[GEMINI_API_KEY_ENV];
  if (!apiKey) {
    sendJson(response, 500, {
      error: "Gemini API key is not configured.",
      hint: options.apiKeyHint || `Set ${GEMINI_API_KEY_ENV} in the environment.`
    });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request, options.maxBytes || MAX_BODY_BYTES);
  } catch (error) {
    sendJson(response, 400, { error: error.message || "Invalid JSON body." });
    return;
  }

  const model = normalizeRequestedModel(body?.model);
  if (!model) {
    sendJson(response, 400, {
      error: "Model not allowed.",
      hint: `Use one of: ${getAllowedModels().join(", ")}.`
    });
    return;
  }

  const storyboardRequest = body?.request;
  if (!isValidStoryboardRequest(storyboardRequest)) {
    sendJson(response, 400, {
      error: "Invalid storyboard request payload.",
      hint: "Shonode only accepts the expected JSON storyboard schema."
    });
    return;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  let upstreamResponse;
  try {
    upstreamResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(storyboardRequest)
    });
  } catch (error) {
    sendJson(response, 502, {
      error: "Failed to reach Gemini upstream.",
      details: error.message || "Unknown fetch error."
    });
    return;
  }

  const responseText = await upstreamResponse.text();
  response.statusCode = upstreamResponse.status;
  response.setHeader("Content-Type", upstreamResponse.headers.get("content-type") || "application/json; charset=utf-8");
  response.end(responseText);
}

function getOriginPolicy(request, options = {}) {
  const origin = getHeaderValue(request.headers?.origin);
  const requestOrigin = inferRequestOrigin(request);
  const allowedOrigins = new Set(parseAllowedOrigins(process.env.SHONODE_ALLOWED_ORIGINS));

  if (requestOrigin) {
    allowedOrigins.add(requestOrigin);
  }

  for (const value of options.allowedOrigins || []) {
    if (typeof value === "string" && value.trim()) {
      allowedOrigins.add(value.trim());
    }
  }

  const allowMissingOrigin = options.allowMissingOrigin ?? !process.env.VERCEL;
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
  const protocol = forwardedProto
    || (host.startsWith("127.0.0.1") || host.startsWith("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
}

function getHeaderValue(value) {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : "";
  }

  return typeof value === "string" ? value : "";
}

function parseAllowedOrigins(value) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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

function isValidStoryboardRequest(candidate) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return false;
  }

  if (!Array.isArray(candidate.contents) || candidate.contents.length === 0 || candidate.contents.length > MAX_CONTENTS) {
    return false;
  }

  if (!candidate.contents.every(isValidContent)) {
    return false;
  }

  const generationConfig = candidate.generationConfig;
  if (!generationConfig || typeof generationConfig !== "object" || Array.isArray(generationConfig)) {
    return false;
  }

  return generationConfig.responseMimeType === "application/json";
}

function isValidContent(content) {
  return Boolean(
    content
    && typeof content === "object"
    && !Array.isArray(content)
    && Array.isArray(content.parts)
    && content.parts.length > 0
    && content.parts.length <= MAX_PARTS_PER_CONTENT
    && content.parts.every(isValidPart)
  );
}

function isValidPart(part) {
  if (!part || typeof part !== "object" || Array.isArray(part)) {
    return false;
  }

  const hasValidText = typeof part.text === "string" && part.text.trim().length > 0 && part.text.length <= MAX_TEXT_LENGTH;
  const inlineData = part.inlineData || part.inline_data;
  const hasValidInlineData = isValidInlineData(inlineData);

  return hasValidText || hasValidInlineData;
}

function isValidInlineData(inlineData) {
  if (!inlineData || typeof inlineData !== "object" || Array.isArray(inlineData)) {
    return false;
  }

  const mimeType = typeof inlineData.mimeType === "string"
    ? inlineData.mimeType
    : typeof inlineData.mime_type === "string"
      ? inlineData.mime_type
      : "";
  const data = typeof inlineData.data === "string" ? inlineData.data : "";

  return Boolean(mimeType.startsWith("image/") && data.length > 0 && data.length <= MAX_INLINE_DATA_LENGTH);
}

function normalizeRequestedModel(value) {
  const requestedModel = sanitizeModel(value);
  const fallbackModel = sanitizeModel(DEFAULT_MODEL) || DEFAULT_ALLOWED_MODELS[0];
  const model = requestedModel || fallbackModel;

  return getAllowedModels().includes(model) ? model : "";
}

function sanitizeModel(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  return /^[a-zA-Z0-9._-]+$/.test(trimmed) ? trimmed : "";
}

function getAllowedModels() {
  const configured = typeof process.env.SHONODE_ALLOWED_GEMINI_MODELS === "string"
    ? process.env.SHONODE_ALLOWED_GEMINI_MODELS.split(",").map(sanitizeModel).filter(Boolean)
    : [];

  return configured.length > 0 ? configured : DEFAULT_ALLOWED_MODELS;
}

function checkRateLimit(clientKey, options = {}) {
  const maxRequests = Number.isFinite(options.rateLimitPerMinute)
    ? options.rateLimitPerMinute
    : RATE_LIMIT_MAX_REQUESTS;
  if (!Number.isFinite(maxRequests) || maxRequests <= 0) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const now = Date.now();
  const windowMs = Number.isFinite(options.rateLimitWindowMs)
    ? options.rateLimitWindowMs
    : RATE_LIMIT_WINDOW_MS;
  const bucketKey = clientKey || "unknown";
  const bucket = rateLimitBuckets.get(bucketKey);
  if (!bucket || now >= bucket.resetAt) {
    rateLimitBuckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    pruneRateLimitBuckets(now);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

function pruneRateLimitBuckets(now) {
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (now >= bucket.resetAt) {
      rateLimitBuckets.delete(key);
    }
  }
}

function getClientAddress(request) {
  if (process.env.VERCEL || process.env.SHONODE_TRUST_PROXY === "true") {
    const forwardedFor = getHeaderValue(request.headers?.["x-forwarded-for"]);
    const forwardedAddress = forwardedFor.split(",")[0].trim();
    if (forwardedAddress) {
      return forwardedAddress;
    }
  }

  return request.socket?.remoteAddress || "unknown";
}

function setSecurityHeaders(response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

function setCorsHeaders(response, allowOrigin) {
  setSecurityHeaders(response);
  if (allowOrigin) {
    response.setHeader("Access-Control-Allow-Origin", allowOrigin);
    response.setHeader("Vary", "Origin");
  }

  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(response, statusCode, payload) {
  setSecurityHeaders(response);
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

module.exports = {
  handleStoryboardProxy,
  sendJson
};
