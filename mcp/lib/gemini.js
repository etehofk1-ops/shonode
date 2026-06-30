// lib/gemini.js — the only impure (network) part of Layer 2.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url)); // mcp/lib
const PROJECT_ENV = join(HERE, "..", "..", ".env"); // Shonode/.env

// env GEMINI_API_KEY first, else parse the project .env (same key the app/server use).
export async function resolveGeminiKey() {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    return process.env.GEMINI_API_KEY.trim();
  }
  try {
    const raw = await readFile(PROJECT_ENV, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      if (t.slice(0, eq).trim() === "GEMINI_API_KEY") {
        return t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* no .env */
  }
  return "";
}

export async function callGemini(model, request, apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  let res;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(request),
    });
  } catch (e) {
    throw new Error(`Failed to reach Gemini: ${e.message}`);
  }
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Gemini ${res.status}: ${text.slice(0, 400)}`);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Gemini returned non-JSON: ${e.message}`);
  }
}
