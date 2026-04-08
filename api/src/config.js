import dotenv from "dotenv";

dotenv.config();

/** Default: stable budget model per Google AI docs. Override e.g. gemini-3.1-flash-lite-preview for newest preview. */
export const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

export const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/professorx",
  jwtSecret: process.env.JWT_SECRET || "dev-only-change-me",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: GEMINI_MODEL,
};
