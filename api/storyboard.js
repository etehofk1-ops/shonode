const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_KEY_ENV = "GEMINI_API_KEY";

module.exports = async (request, response) => {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.statusCode = 204;
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
      hint: `Set ${GEMINI_API_KEY_ENV} in the Vercel project environment variables.`
    });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request);
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
  response.statusCode = upstreamResponse.status;
  response.setHeader("Content-Type", upstreamResponse.headers.get("content-type") || "application/json; charset=utf-8");
  response.end(responseText);
};

async function readJsonBody(request) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  if (typeof request.body === "string") {
    return request.body ? JSON.parse(request.body) : {};
  }

  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
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
