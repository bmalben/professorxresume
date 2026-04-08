import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authRequired } from "../middleware/auth.js";
import { JobAnalysis } from "../models/JobAnalysis.js";
import { generateText } from "../gemini/client.js";
import { jobIntelPrompt, englishCoachPrompt } from "../gemini/prompts.js";
import { config } from "../config.js";

const router = Router();

const geminiLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authRequired, geminiLimiter);

router.post("/job-intel", async (req, res) => {
  try {
    const { jobRole, jobDescription } = req.body || {};
    if (!jobRole || !String(jobRole).trim()) {
      return res.status(400).json({ error: "jobRole is required" });
    }
    const role = String(jobRole).trim();
    const desc = jobDescription != null ? String(jobDescription).slice(0, 16_000) : "";
    const prompt = jobIntelPrompt(role, desc);
    const generatedSummary = await generateText(prompt);
    await JobAnalysis.create({
      userId: req.userId,
      role,
      descriptionSnippet: desc.slice(0, 500),
      generatedSummary,
    });
    return res.json({ content: generatedSummary, model: config.geminiModel });
  } catch (e) {
    const msg = e.message || "AI error";
    if (/GEMINI_API_KEY/.test(msg)) return res.status(503).json({ error: "AI not configured" });
    return res.status(500).json({ error: msg });
  }
});

router.post("/english", async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "text is required" });
    }
    const prompt = englishCoachPrompt(String(text));
    const content = await generateText(prompt);
    return res.json({ content, model: config.geminiModel });
  } catch (e) {
    const msg = e.message || "AI error";
    if (/GEMINI_API_KEY/.test(msg)) return res.status(503).json({ error: "AI not configured" });
    return res.status(500).json({ error: msg });
  }
});

export default router;
