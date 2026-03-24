const http = require("node:http");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");

const ROOT_DIR = __dirname;
const GEMINI_API_KEY_ENV = "GEMINI_API_KEY";

loadEnvFile(path.join(ROOT_DIR, ".env"));

const DEFAULT_PORT = Number.parseInt(process.env.PORT || "4173", 10);
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

const requestHandler = async (request, response) => {
  try {
    if (!request.url) {
      sendJson(response, 400, { error: "Missing request URL." });
      return;
    }

    const requestUrl = new URL(request.url, `http://${request.headers.host || "127.0.0.1"}`);

    if (requestUrl.pathname === "/api/storyboard") {
      await handleStoryboardProxy(request, response);
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      sendJson(response, 405, { error: "Method not allowed." });
      return;
    }

    await serveStaticFile(requestUrl.pathname, response, request.method === "HEAD");
  } catch (error) {
    console.error("[Shonode] Unexpected server error:", error);
    sendJson(response, 500, { error: "Unexpected server error." });
  }
};

listenWithFallback(DEFAULT_PORT, 8);

async function handleStoryboardProxy(request, response) {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  const apiKey = process.env[GEMINI_API_KEY_ENV];
  if (!apiKey) {
    sendJson(response, 500, {
      error: "Gemini API key is not configured.",
      hint: `Set ${GEMINI_API_KEY_ENV} in .env or the environment.`
    });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request, 60 * 1024 * 1024);
  } catch (error) {
    sendJson(response, 400, { error: error.message || "Invalid JSON body." });
    return;
  }

  const model = sanitizeModel(body?.model) || DEFAULT_MODEL;
  const storyboardRequest = body?.request;
  if (!storyboardRequest || typeof storyboardRequest !== "object") {
    sendJson(response, 400, { error: "Missing Gemini request payload." });
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
  const contentType = upstreamResponse.headers.get("content-type") || "application/json; charset=utf-8";

  response.statusCode = upstreamResponse.status;
  response.setHeader("Content-Type", contentType);
  setCorsHeaders(response);
  response.end(responseText);
}

async function serveStaticFile(requestPath, response, isHeadRequest = false) {
  const pathname = requestPath === "/" ? "/index.html" : requestPath;
  const safePath = decodeURIComponent(pathname);
  const pathSegments = safePath.split("/").filter(Boolean);

  if (pathSegments.some((segment) => segment.startsWith("."))) {
    sendJson(response, 404, { error: "File not found." });
    return;
  }

  const resolvedPath = path.resolve(ROOT_DIR, `.${safePath}`);

  if (!resolvedPath.startsWith(ROOT_DIR)) {
    sendJson(response, 403, { error: "Forbidden path." });
    return;
  }

  let stats;
  try {
    stats = await fsp.stat(resolvedPath);
  } catch {
    sendJson(response, 404, { error: "File not found." });
    return;
  }

  if (stats.isDirectory()) {
    await serveStaticFile(path.posix.join(pathname, "index.html"), response, isHeadRequest);
    return;
  }

  const extension = path.extname(resolvedPath).toLowerCase();
  const contentType = MIME_TYPES[extension] || "application/octet-stream";

  response.statusCode = 200;
  response.setHeader("Content-Type", contentType);

  if (isHeadRequest) {
    response.end();
    return;
  }

  fs.createReadStream(resolvedPath).pipe(response);
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function readJsonBody(request, maxBytes) {
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

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");

    if (!key || process.env[key] !== undefined) {
      return;
    }

    process.env[key] = value;
  });
}

function listenWithFallback(startPort, retriesLeft) {
  const server = http.createServer(requestHandler);

  server.on("error", (error) => {
    if (error?.code === "EADDRINUSE" && retriesLeft > 0) {
      const nextPort = startPort + 1;
      console.warn(`[Shonode] Port ${startPort} is already in use. Trying ${nextPort}...`);
      listenWithFallback(nextPort, retriesLeft - 1);
      return;
    }

    console.error(`[Shonode] Failed to start server on port ${startPort}.`, error);
    process.exit(1);
  });

  server.listen(startPort, () => {
    process.env.PORT = String(startPort);
    console.log(`[Shonode] Server running at http://127.0.0.1:${startPort}`);
  });
}
