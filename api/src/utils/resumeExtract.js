import { createRequire } from "module";
import mammoth from "mammoth";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const MAX_BYTES = 5 * 1024 * 1024;

export function assertResumeFile(file) {
  if (!file?.buffer?.length) throw new Error("Resume file required");
  if (file.size > MAX_BYTES) throw new Error("File too large (max 5MB)");
  const name = (file.originalname || "").toLowerCase();
  const ok =
    name.endsWith(".pdf") || name.endsWith(".docx") || name.endsWith(".txt");
  if (!ok) throw new Error("Only PDF, DOCX, or TXT allowed");
}

export async function extractResumeText(file) {
  assertResumeFile(file);
  const name = (file.originalname || "").toLowerCase();
  const buf = file.buffer;

  if (name.endsWith(".txt")) {
    return buf.toString("utf8").slice(0, 50_000);
  }
  if (name.endsWith(".pdf")) {
    const data = await pdfParse(buf);
    return (data.text || "").trim().slice(0, 50_000);
  }
  if (name.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer: buf });
    return (value || "").trim().slice(0, 50_000);
  }
  throw new Error("Unsupported type");
}
