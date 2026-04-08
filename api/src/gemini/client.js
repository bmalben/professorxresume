import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config.js";

const REQUEST_MS = 55_000;
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 600;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getModel() {
  if (!config.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  return genAI.getGenerativeModel({
    model: config.geminiModel,
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7,
    },
  });
}

async function withTimeout(promise, ms, label) {
  let t;
  const timeout = new Promise((_, rej) => {
    t = setTimeout(() => rej(new Error(`${label} timed out`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(t);
  }
}

/**
 * Generate text via Gemini. Uses config.geminiModel (default: gemini-2.5-flash-lite).
 */
export async function generateText(prompt) {
  const model = getModel();
  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await withTimeout(model.generateContent(prompt), REQUEST_MS, "Gemini");
      const text = result.response.text();
      const trimmed = typeof text === "string" ? text.trim() : "";
      if (!trimmed) throw new Error("Empty model response");
      return trimmed;
    } catch (e) {
      lastErr = e;
      const retriable =
        /429|503|UNAVAILABLE|timeout|timed out|ECONNRESET|fetch/i.test(String(e?.message || e));
      if (attempt < MAX_RETRIES && retriable) {
        await sleep(BASE_DELAY_MS * 2 ** attempt);
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

export function parseEvaluationJson(raw) {
  let cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) cleaned = cleaned.slice(start, end + 1);
  const parsed = JSON.parse(cleaned);
  if (typeof parsed.score !== "number" || typeof parsed.feedback !== "string") {
    throw new Error("Invalid evaluation shape");
  }
  const score = Math.max(0, Math.min(100, Math.round(parsed.score)));
  return { score, feedback: parsed.feedback.trim() };
}
