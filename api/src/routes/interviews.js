import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { authRequired } from "../middleware/auth.js";
import { Interview } from "../models/Interview.js";
import { Question } from "../models/Question.js";
import { Response } from "../models/Response.js";
import { Result } from "../models/Result.js";
import { ResumeMeta } from "../models/ResumeMeta.js";
import { extractResumeText } from "../utils/resumeExtract.js";
import { generateText, parseEvaluationJson } from "../gemini/client.js";
import { config } from "../config.js";
import {
  mockInterviewQuestionPrompt,
  interviewEvaluationPrompt,
} from "../gemini/prompts.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const geminiLimiter = rateLimit({
  windowMs: 60_000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authRequired);

router.get("/", async (req, res) => {
  const list = await Interview.find({ userId: req.userId })
    .sort({ updatedAt: -1 })
    .limit(50)
    .select("jobRole status score createdAt updatedAt questionTarget");
  res.json({ interviews: list });
});

router.post("/", geminiLimiter, upload.single("resume"), async (req, res) => {
  try {
    const jobRole = req.body?.jobRole;
    const jobDescription = req.body?.jobDescription || "";
    if (!jobRole || !String(jobRole).trim()) {
      return res.status(400).json({ error: "jobRole is required" });
    }
    let resumeText = "";
    if (req.file) {
      resumeText = await extractResumeText(req.file);
    }
    const interview = await Interview.create({
      userId: req.userId,
      jobRole: String(jobRole).trim(),
      jobDescription: String(jobDescription).slice(0, 16_000),
      resumeText,
    });
    if (req.file) {
      await ResumeMeta.create({
        userId: req.userId,
        interviewId: interview._id,
        filename: req.file.originalname || "resume",
        extractedTextLength: resumeText.length,
      });
    }
    return res.status(201).json({ interview });
  } catch (e) {
    return res.status(400).json({ error: e.message || "Could not start interview" });
  }
});

async function loadInterviewForUser(id, userId) {
  const interview = await Interview.findOne({ _id: id, userId });
  return interview;
}

router.get("/:id", async (req, res) => {
  const interview = await loadInterviewForUser(req.params.id, req.userId);
  if (!interview) return res.status(404).json({ error: "Not found" });
  const questions = await Question.find({ interviewId: interview._id }).sort({ order: 1 });
  const qIds = questions.map((q) => q._id);
  const responses = await Response.find({ questionId: { $in: qIds } });
  const byQ = new Map(responses.map((r) => [r.questionId.toString(), r]));
  const thread = questions.map((q) => ({
    id: q._id,
    order: q.order,
    text: q.text,
    difficulty: q.difficulty,
    source: q.source,
    response: byQ.get(q._id.toString())
      ? { answer: byQ.get(q._id.toString()).answer, timestamp: byQ.get(q._id.toString()).timestamp }
      : null,
  }));
  const answered = thread.filter((t) => t.response).length;
  const progress = {
    answered,
    target: interview.questionTarget,
    percent: Math.min(100, Math.round((answered / interview.questionTarget) * 100)),
  };
  res.json({ interview, thread, progress });
});

router.post("/:id/next-question", geminiLimiter, async (req, res) => {
  try {
    const interview = await loadInterviewForUser(req.params.id, req.userId);
    if (!interview) return res.status(404).json({ error: "Not found" });
    if (interview.status === "completed") {
      return res.status(400).json({ error: "Interview already completed" });
    }

    const questions = await Question.find({ interviewId: interview._id }).sort({ order: 1 });
    if (questions.length >= interview.questionTarget) {
      return res.status(400).json({ error: "Question limit reached — submit answers and complete" });
    }

    if (questions.length > 0) {
      const last = questions[questions.length - 1];
      const hasAnswer = await Response.findOne({ questionId: last._id });
      if (!hasAnswer) {
        return res.status(400).json({ error: "Answer the current question before requesting the next" });
      }
    }

    const history = [];
    for (const q of questions) {
      const r = await Response.findOne({ questionId: q._id });
      history.push({ question: q.text, answer: r?.answer || "" });
    }

    const prompt = mockInterviewQuestionPrompt({
      jobRole: interview.jobRole,
      resumeText: interview.resumeText,
      history,
    });
    const text = await generateText(prompt);
    const order = questions.length;
    const question = await Question.create({
      interviewId: interview._id,
      text,
      order,
      source: { provider: "gemini", model: config.geminiModel },
    });
    return res.json({ question });
  } catch (e) {
    console.error("Error in next-question:", e);
    const msg = e.message || "AI error";
    if (/GEMINI_API_KEY|API key not valid/i.test(msg)) {
      return res.status(503).json({ error: "AI not configured: Please provide a valid Gemini API key in your .env file." });
    }
    return res.status(500).json({ error: msg });
  }
});

router.post("/:id/answer", async (req, res) => {
  const { questionId, answer } = req.body || {};
  if (!questionId || answer == null || !String(answer).trim()) {
    return res.status(400).json({ error: "questionId and answer required" });
  }
  const interview = await loadInterviewForUser(req.params.id, req.userId);
  if (!interview) return res.status(404).json({ error: "Not found" });
  if (interview.status === "completed") {
    return res.status(400).json({ error: "Interview completed" });
  }
  const q = await Question.findOne({ _id: questionId, interviewId: interview._id });
  if (!q) return res.status(404).json({ error: "Question not found" });
  const existing = await Response.findOne({ questionId: q._id });
  if (existing) {
    return res.status(400).json({ error: "Already answered" });
  }
  await Response.create({
    questionId: q._id,
    answer: String(answer).slice(0, 32_000),
  });
  return res.json({ ok: true });
});

router.post("/:id/complete", geminiLimiter, async (req, res) => {
  try {
    const interview = await loadInterviewForUser(req.params.id, req.userId);
    if (!interview) return res.status(404).json({ error: "Not found" });
    if (interview.status === "completed") {
      const existing = await Result.findOne({ interviewId: interview._id });
      return res.json({ interview, result: existing });
    }

    const questions = await Question.find({ interviewId: interview._id }).sort({ order: 1 });
    const qaPairs = [];
    for (const q of questions) {
      const r = await Response.findOne({ questionId: q._id });
      if (r) qaPairs.push({ q: q.text, a: r.answer });
    }
    if (qaPairs.length === 0) {
      return res.status(400).json({ error: "Answer at least one question before completing" });
    }

    const raw = await generateText(
      interviewEvaluationPrompt({ jobRole: interview.jobRole, qaPairs })
    );
    let score = 75;
    let feedback = raw.slice(0, 2000);
    try {
      const parsed = parseEvaluationJson(raw);
      score = parsed.score;
      feedback = parsed.feedback;
    } catch {
      /* use fallback if model did not return strict JSON */
    }

    await Result.findOneAndUpdate(
      { interviewId: interview._id },
      { score, feedback },
      { upsert: true, new: true }
    );
    interview.status = "completed";
    interview.score = score;
    await interview.save();

    const result = await Result.findOne({ interviewId: interview._id });
    return res.json({ interview, result });
  } catch (e) {
    console.error("Error in complete-interview:", e);
    const msg = e.message || "Could not complete";
    if (/GEMINI_API_KEY|API key not valid/i.test(msg)) {
      return res.status(503).json({ error: "AI not configured: Please provide a valid Gemini API key in your .env file." });
    }
    return res.status(500).json({ error: msg });
  }
});

export default router;
