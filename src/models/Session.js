const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    _id: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
    csrf: { type: String, required: true },
  },
  { timestamps: true },
);
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model("Session", schema);
