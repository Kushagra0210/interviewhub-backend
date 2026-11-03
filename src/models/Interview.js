const mongoose = require("mongoose");
const turn = new mongoose.Schema(
  {
    key: String,
    question: String,
    topic: String,
    answer: String,
    feedback: String,
  },
  { timestamps: true },
);
const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: String,
    difficulty: String,
    type: String,
    topics: [String],
    questionCount: Number,
    status: {
      type: String,
      enum: [
        "created",
        "active",
        "generating",
        "evaluating",
        "completed",
        "failed",
        "cancelled",
      ],
      default: "created",
    },
    turns: [turn],
    report: mongoose.Schema.Types.Mixed,
    operation: String,
    operationId: String,
    leaseUntil: Date,
    error: String,
    version: { type: Number, default: 0 },
    promptVersion: String,
    model: String,
  },
  { timestamps: true },
);
schema.index({ user: 1, createdAt: -1 });
module.exports = mongoose.model("Interview", schema);
