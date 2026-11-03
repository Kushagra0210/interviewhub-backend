const { Router } = require("express");
const Interview = require("../models/Interview");
const Question = require("../models/Question");
const Topic = require("../models/Topics");
const router = Router();
router.use(require("../middleware/authMiddleware"));
router.get("/", async (req, res) => {
  const sessions = await Interview.find({
    user: req.user._id,
    status: "completed",
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  const scores = new Map();
  for (const s of sessions)
    for (const e of s.report?.questionEvaluations || []) {
      const key = String(e.topic).toLowerCase();
      const row = scores.get(key) || { topic: e.topic, sum: 0, count: 0 };
      row.sum += e.score;
      row.count++;
      scores.set(key, row);
    }
  const topics = [...scores.values()]
    .map((t) => ({
      topic: t.topic,
      score: Math.round(t.sum / t.count),
      attempts: t.count,
    }))
    .sort((a, b) => a.score - b.score);
  const recommendations = topics
    .filter((t) => t.score < 75)
    .slice(0, 5)
    .map((t) => ({
      topic: t.topic,
      reason: `Average practice score ${t.score}/100 across ${t.attempts} evaluated answers.`,
      action: `Review ${t.topic}, then explain a fresh example and its edge cases.`,
    }));
  if (sessions.length && !recommendations.length)
    recommendations.push({
      topic: "Mixed Technical",
      reason: "No recurring weak topic is established yet.",
      action:
        "Try a different topic or a higher difficulty to broaden your practice.",
    });
  const topicNames = recommendations.map((r) => r.topic.toLowerCase());
  const taxonomy = await Topic.find().limit(100).lean();
  const matching = taxonomy
    .filter((t) => topicNames.includes(t.name.toLowerCase()))
    .map((t) => t._id);
  const questions = await Question.find({
    status: "published",
    ...(matching.length ? { topics: { $in: matching } } : {}),
  })
    .sort({ createdAt: -1 })
    .limit(6)
    .select("title difficulty topics");
  res.json({
    topics,
    recommendations,
    questions,
    completed: sessions.length,
    method:
      "Rule-based: prioritize topics below 75/100; scores are AI practice estimates.",
  });
});
module.exports = router;
