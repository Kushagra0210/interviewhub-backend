const { Router } = require("express");
const { z } = require("zod");
const { randomUUID } = require("crypto");
const Interview = require("../models/Interview");
const protect = require("../middleware/authMiddleware");
const { validate, HttpError } = require("../utils/http");
const ai = require("../services/ai");
const running = new Map();
const router = Router();
router.use(protect);
const { rateLimit } = require("express-rate-limit");
router.use(
  rateLimit({
    windowMs: 60000,
    limit: 30,
    keyGenerator: (req) => String(req.user._id),
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);
const setup = z
  .object({
    role: z.enum([
      "Software Development Engineer",
      "Frontend Engineer",
      "Backend Engineer",
      "Full-Stack Engineer",
      "AI/ML Engineer",
      "Applied AI / GenAI Engineer",
    ]),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    type: z.enum([
      "DSA",
      "Web Development",
      "Backend Engineering",
      "Core CS",
      "Machine Learning",
      "GenAI / LLM Engineering",
      "Mixed Technical",
    ]),
    topics: z.array(z.string().min(1).max(80)).max(8).default([]),
    questionCount: z.number().int().min(1).max(10).default(5),
  })
  .strict();
async function owned(req) {
  const session = await Interview.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!session) throw new HttpError(404, "Interview not found");
  return session;
}
async function generate(req, session, operation) {
  const operationId = randomUUID();
  const locked = await Interview.findOneAndUpdate(
    {
      _id: session._id,
      user: req.user._id,
      version: session.version,
      $or: [
        { leaseUntil: { $exists: false } },
        { leaseUntil: null },
        { leaseUntil: { $lt: new Date() } },
      ],
    },
    {
      $set: {
        status: operation === "report" ? "evaluating" : "generating",
        operation,
        operationId,
        leaseUntil: new Date(Date.now() + 190000),
        error: "",
      },
      $inc: { version: 1 },
    },
    { returnDocument: "after" },
  );
  if (!locked)
    throw new HttpError(
      409,
      "Another operation is in progress. Reload the interview.",
    );
  const controller = new AbortController();
  running.set(String(locked._id), controller);
  try {
    const result = await ai(
      req,
      operation === "report" ? "/evaluate" : "/turn",
      {
        role: locked.role,
        difficulty: locked.difficulty,
        type: locked.type,
        topics: locked.topics,
        turns: locked.turns.map((t) => ({
          question: t.question,
          topic: t.topic,
          answer: t.answer || "",
        })),
      },
      controller.signal,
    );
    const update = {
      status: operation === "report" ? "completed" : "active",
      leaseUntil: null,
      promptVersion: result.promptVersion,
      model: result.model,
    };
    if (operation === "report") {
      z.object({
        overallScore: z.number().min(0).max(100),
        technicalCorrectness: z.number().min(0).max(100),
        reasoning: z.number().min(0).max(100),
        communication: z.number().min(0).max(100),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        recommendations: z.array(z.string()),
      }).parse(result.report);
      update.report = result.report;
    } else {
      const turn = z
        .object({
          question: z.string().min(1).max(5000),
          topic: z.string().max(100),
          feedback: z.string().max(5000).default(""),
        })
        .parse(result);
      update.turns = [
        ...locked.turns.map((t) => t.toObject()),
        { question: turn.question, topic: turn.topic, feedback: turn.feedback },
      ];
    }
    return await Interview.findOneAndUpdate(
      { _id: locked._id, operationId, status: locked.status },
      { $set: update, $inc: { version: 1 } },
      { returnDocument: "after" },
    );
  } catch (error) {
    await Interview.updateOne(
      { _id: locked._id, operationId, status: locked.status },
      {
        $set: {
          status: "failed",
          leaseUntil: null,
          error: "AI generation failed. Retry to continue.",
        },
        $inc: { version: 1 },
      },
    );
    throw error;
  } finally {
    if (running.get(String(locked._id)) === controller)
      running.delete(String(locked._id));
  }
}
router.get("/", async (req, res) =>
  res.json({
    interviews: await Interview.find({ user: req.user._id })
      .select("-turns -report")
      .sort({ createdAt: -1 })
      .limit(100),
  }),
);
router.post("/", validate(setup), async (req, res) => {
  const session = await Interview.create({ ...req.body, user: req.user._id });
  res.status(201).json({ interview: session });
});
router.get("/:id", async (req, res) =>
  res.json({ interview: await owned(req) }),
);
router.post("/:id/start", async (req, res) => {
  const s = await owned(req);
  if (s.status !== "created")
    throw new HttpError(409, "Interview already started");
  res.json({ interview: await generate(req, s, "turn") });
});
router.post(
  "/:id/answers",
  validate(
    z
      .object({
        answer: z.string().trim().min(1).max(8000),
        key: z.uuid(),
        version: z.number().int().min(0),
      })
      .strict(),
  ),
  async (req, res) => {
    let s = await owned(req);
    if (s.turns.some((t) => t.key === req.body.key))
      return res.json({ interview: s });
    if (
      s.status !== "active" ||
      s.version !== req.body.version ||
      !s.turns.length ||
      s.turns.at(-1).answer
    )
      throw new HttpError(409, "Interview changed. Reload before answering.");
    const position = s.turns.length - 1;
    s = await Interview.findOneAndUpdate(
      { _id: s._id, version: s.version, status: "active" },
      {
        $set: {
          [`turns.${position}.answer`]: req.body.answer,
          [`turns.${position}.key`]: req.body.key,
          status: "created",
          operation: s.turns.length >= s.questionCount ? "report" : "turn",
        },
        $inc: { version: 1 },
      },
      { returnDocument: "after" },
    );
    if (!s) throw new HttpError(409, "Answer already submitted");
    res.json({ interview: await generate(req, s, s.operation) });
  },
);
router.post("/:id/retry", async (req, res) => {
  const s = await owned(req);
  if (!["failed", "created", "generating", "evaluating"].includes(s.status))
    throw new HttpError(409, "Nothing to retry");
  res.json({ interview: await generate(req, s, s.operation || "turn") });
});
router.post("/:id/complete", async (req, res) => {
  const s = await owned(req);
  if (s.status === "completed") return res.json({ interview: s });
  if (
    !["active", "failed"].includes(s.status) ||
    !s.turns.some((t) => t.answer)
  )
    throw new HttpError(409, "Submit an answer before completing");
  res.json({ interview: await generate(req, s, "report") });
});
router.post("/:id/cancel", async (req, res) => {
  const s = await owned(req);
  if (s.status === "completed")
    throw new HttpError(409, "Interview already completed");
  const cancelled = await Interview.findOneAndUpdate(
    { _id: s._id, user: req.user._id, status: { $ne: "completed" } },
    { $set: { status: "cancelled", leaseUntil: null }, $inc: { version: 1 } },
    { returnDocument: "after" },
  );
  if (!cancelled) throw new HttpError(409, "Interview already completed");
  running.get(String(s._id))?.abort();
  res.json({ interview: cancelled });
});
module.exports = router;
