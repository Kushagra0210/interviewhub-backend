const { Router } = require("express");
const { z } = require("zod");
const Question = require("../models/Question");
const Topic = require("../models/Topics");
const Company = require("../models/Company");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const { validate, HttpError } = require("../utils/http");
const ai = require("../services/ai");
const router = Router();
const id = z.string().regex(/^[a-f\d]{24}$/i);
const text = z.string().trim().min(1).max(10000);
const questionSchema = z
  .object({
    title: text.max(200),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .max(200),
    description: text,
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    topics: z.array(id).max(10).default([]),
    companies: z.array(id).max(10).default([]),
    roles: z.array(z.string().max(80)).max(6).default([]),
    expectedConcepts: z.array(z.string().max(200)).max(20).default([]),
    rubric: z.string().max(5000).default(""),
    status: z.enum(["draft", "published", "archived"]).default("published"),
    attribution: z.string().max(500).default("Original practice question"),
    platform: z.string().max(100).optional(),
    platformLink: z
      .union([z.url().refine((v) => /^https?:/.test(v)), z.literal("")])
      .optional(),
  })
  .strict();
const taxonomy = z
  .object({
    name: text.max(100),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .max(100),
    description: z.string().max(2000).default(""),
    logo: z.union([z.url(), z.literal("")]).optional(),
  })
  .strict();
router.get("/questions/search", async (req, res) => {
  const q = z
    .string()
    .max(500)
    .parse(req.query.q || "");
  const filter = { status: "published" };
  for (const key of ["difficulty", "roles", "topics", "companies"])
    if (req.query[key]) filter[key] = z.string().max(100).parse(req.query[key]);
  const page = z.coerce
    .number()
    .int()
    .min(1)
    .max(10000)
    .parse(req.query.page || 1);
  let mode = "keyword",
    matches;
  if (q && req.query.semantic === "true") {
    try {
      const result = await ai(req, "/search", {
        query: q,
        filters: filter,
        limit: 100,
      });
      matches = result.ids;
      mode = "semantic";
    } catch {
      mode = "keyword-fallback";
    }
  }
  if (matches)
    filter._id = { $in: matches.filter((v) => id.safeParse(v).success) };
  else if (q)
    filter.$or = ["title", "description"].map((key) => ({
      [key]: {
        $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      },
    }));
  const sort = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    title: { title: 1 },
  }[req.query.sort || "newest"];
  if (!sort) throw new HttpError(400, "Invalid sort");
  let questions = await Question.find(filter)
    .populate("topics companies")
    .sort(sort)
    .limit(matches ? 100 : 20)
    .skip(matches ? 0 : (page - 1) * 20)
    .lean();
  if (matches)
    questions = questions
      .sort(
        (a, b) =>
          matches.indexOf(String(a._id)) - matches.indexOf(String(b._id)),
      )
      .slice((page - 1) * 20, page * 20);
  res.json({
    success: true,
    questions,
    total: await Question.countDocuments(filter),
    page,
    mode,
  });
});
router.get("/questions", (req, res) =>
  res.redirect(
    307,
    `/api/v1/questions/search?${new URLSearchParams(req.query)}`,
  ),
);
router.get("/questions/:id", async (req, res) => {
  const question = await Question.findOne({
    _id: req.params.id,
    status: "published",
  }).populate("topics companies");
  if (!question) throw new HttpError(404, "Question not found");
  res.json({ success: true, question });
});
router.get("/admin/questions", protect, admin, async (_req, res) =>
  res.json({
    success: true,
    questions: await Question.find()
      .sort({ updatedAt: -1 })
      .limit(100)
      .populate("topics companies"),
  }),
);
async function references(body) {
  for (const [field, Model] of [
    ["topics", Topic],
    ["companies", Company],
  ])
    if (
      body[field] &&
      (await Model.countDocuments({ _id: { $in: body[field] } })) !==
        new Set(body[field]).size
    )
      throw new HttpError(400, `Unknown ${field}`);
}
router.post(
  "/questions",
  protect,
  admin,
  validate(questionSchema),
  async (req, res) => {
    await references(req.body);
    res
      .status(201)
      .json({ success: true, question: await Question.create(req.body) });
  },
);
router.put(
  "/questions/:id",
  protect,
  admin,
  validate(questionSchema.partial()),
  async (req, res) => {
    await references(req.body);
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $set: req.body, $inc: { indexRevision: 1 } },
      { returnDocument: "after", runValidators: true },
    );
    if (!question) throw new HttpError(404, "Question not found");
    res.json({ success: true, question });
  },
);
router.delete("/questions/:id", protect, admin, async (req, res) => {
  const question = await Question.findByIdAndUpdate(req.params.id, {
    $set: { status: "archived" },
    $inc: { indexRevision: 1 },
  });
  if (!question) throw new HttpError(404, "Question not found");
  res.json({ success: true });
});
router.post("/questions/:id/bookmark", protect, async (req, res) => {
  const question = await Question.findOne({
    _id: req.params.id,
    status: "published",
  });
  if (!question) throw new HttpError(404, "Question not found");
  await User.updateOne(
    { _id: req.user._id },
    { $addToSet: { bookmarks: question._id } },
  );
  res.json({ success: true });
});
router.delete("/questions/:id/bookmark", protect, async (req, res) => {
  id.parse(req.params.id);
  await User.updateOne(
    { _id: req.user._id },
    { $pull: { bookmarks: req.params.id } },
  );
  res.json({ success: true });
});
router.get("/bookmarks", protect, async (req, res) =>
  res.json({
    questions: await Question.find({
      _id: { $in: req.user.bookmarks },
      status: "published",
    }).limit(100),
  }),
);
for (const [path, Model, key] of [
  ["topics", Topic, "topic"],
  ["companies", Company, "company"],
]) {
  router.get(`/${path}`, async (_req, res) =>
    res.json({
      success: true,
      [path]: await Model.find().sort({ name: 1 }).limit(100),
    }),
  );
  router.get(`/${path}/:id`, async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) throw new HttpError(404, "Not found");
    res.json({ success: true, [key]: item });
  });
  router.post(
    `/${path}`,
    protect,
    admin,
    validate(taxonomy),
    async (req, res) =>
      res
        .status(201)
        .json({ success: true, [key]: await Model.create(req.body) }),
  );
  router.put(
    `/${path}/:id`,
    protect,
    admin,
    validate(taxonomy.partial()),
    async (req, res) => {
      const item = await Model.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { returnDocument: "after", runValidators: true },
      );
      if (!item) throw new HttpError(404, "Not found");
      res.json({ success: true, [key]: item });
    },
  );
  router.delete(`/${path}/:id`, protect, admin, async (req, res) => {
    if (await Question.exists({ [path]: req.params.id }))
      throw new HttpError(409, "Remove question references before deleting");
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) throw new HttpError(404, "Not found");
    res.json({ success: true });
  });
}
router.get("/analytics/users-by-city", protect, admin, async (_req, res) =>
  res.json({
    success: true,
    analytics: await User.aggregate([
      { $group: { _id: "$city", totalUsers: { $sum: 1 } } },
    ]),
  }),
);
module.exports = router;
