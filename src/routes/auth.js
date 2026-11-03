const { Router } = require("express");
const { z } = require("zod");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomUUID, randomBytes } = require("crypto");
const { rateLimit } = require("express-rate-limit");
const User = require("../models/User");
const Session = require("../models/Session");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const { validate, HttpError } = require("../utils/http");
const router = Router();
const credentials = z.object({
  email: z
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  password: z.string().min(10).max(72),
});
const profile = z.object({
  name: z.string().trim().min(1).max(80),
  city: z.string().trim().max(100).default(""),
  preferredRole: z.string().max(80).optional(),
});
const limit = rateLimit({
  windowMs: 900000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
async function signIn(req, res, user, status = 200) {
  const config = req.app.locals.config;
  const session = await Session.create({
    _id: randomUUID(),
    user: user._id,
    expiresAt: new Date(Date.now() + 604800000),
    csrf: randomBytes(32).toString("hex"),
  });
  const token = jwt.sign({ id: String(user._id) }, config.JWT_SECRET, {
    algorithm: "HS256",
    jwtid: session._id,
    expiresIn: "7d",
  });
  res.cookie("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.NODE_ENV === "production",
    maxAge: 604800000,
    path: "/",
  });
  const safe = user.toObject();
  delete safe.password;
  res
    .status(status)
    .json({
      success: true,
      user: safe,
      csrfToken: session.csrf,
      ...(req.get("x-auth-mode") === "bearer" ? { token } : {}),
    });
}
router.post(
  "/register",
  limit,
  validate(credentials.extend(profile.shape).strict()),
  async (req, res) => {
    const user = await User.create({
      ...req.body,
      password: await bcrypt.hash(req.body.password, 12),
    });
    await signIn(req, res, user, 201);
  },
);
router.post(
  "/login",
  limit,
  validate(credentials.extend({ password: z.string().min(1).max(72) })),
  async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select(
      "+password",
    );
    if (!user || !(await bcrypt.compare(req.body.password, user.password)))
      throw new HttpError(401, "Invalid credentials");
    await signIn(req, res, user);
  },
);
router.get("/profile", protect, (req, res) =>
  res.json({ success: true, user: req.user, csrfToken: req.session.csrf }),
);
router.post(
  "/profile/photo",
  protect,
  require("../middleware/uploadMiddleware").single("profilePhoto"),
  async (req, res) => {
    const photo = await require("../services/photo")(req.file);
    const previous = req.user.profilePhotoId;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          profilePhoto: photo.secure_url,
          profilePhotoId: photo.public_id,
        },
      },
      { returnDocument: "after" },
    );
    if (previous)
      await require("cloudinary")
        .v2.uploader.destroy(previous)
        .catch(() => req.log.warn("Old avatar cleanup failed"));
    res.json({ success: true, user });
  },
);
router.patch(
  "/profile",
  protect,
  validate(profile.partial().strict()),
  async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { returnDocument: "after", runValidators: true },
    );
    res.json({ success: true, user });
  },
);
router.post("/logout", protect, async (req, res) => {
  await Session.deleteOne({ _id: req.session._id });
  res.clearCookie("session", { path: "/" });
  res.json({ success: true });
});
router.get("/", protect, admin, async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page) || 1);
  res.json({
    success: true,
    users: await User.find()
      .sort({ _id: -1 })
      .skip((page - 1) * 20)
      .limit(20),
    page,
  });
});
router.put(
  "/:id",
  protect,
  admin,
  validate(profile.partial().strict()),
  async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: "after", runValidators: true },
    );
    if (!user) throw new HttpError(404, "User not found");
    res.json({ success: true, user });
  },
);
router.delete("/:id", protect, admin, async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new HttpError(404, "User not found");
  await Session.deleteMany({ user: user._id });
  res.json({ success: true });
});
module.exports = router;
