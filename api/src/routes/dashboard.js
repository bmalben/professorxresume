import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { Interview } from "../models/Interview.js";

const router = Router();

router.use(authRequired);

router.get("/summary", async (req, res) => {
  const userId = req.userId;
  const total = await Interview.countDocuments({ userId });
  const completed = await Interview.countDocuments({ userId, status: "completed" });
  const scored = await Interview.find({
    userId,
    status: "completed",
    score: { $ne: null },
  })
    .select("score createdAt jobRole")
    .sort({ createdAt: 1 })
    .limit(200);

  const scores = scored.map((i) => i.score).filter((s) => typeof s === "number");
  const avgScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const successCount = scores.filter((s) => s >= 70).length;
  const successRate =
    scores.length > 0 ? Math.round((successCount / scores.length) * 100) : null;

  const trends = scored.slice(-12).map((i) => ({
    date: i.createdAt.toISOString().slice(0, 10),
    score: i.score,
    jobRole: i.jobRole,
  }));

  res.json({
    totalInterviews: total,
    completedInterviews: completed,
    averageScore: avgScore,
    successRate,
    trends,
  });
});

export default router;
