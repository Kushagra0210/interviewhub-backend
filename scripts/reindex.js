require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const Question = require("../src/models/Question");
const { randomUUID } = require("crypto");
async function run() {
  const config = require("../src/config/env")();
  await mongoose.connect(config.MONGO_URI);
  const lockSchema = new mongoose.Schema({
    _id: String,
    owner: String,
    until: Date,
  });
  const Lock = mongoose.model("IndexLock", lockSchema);
  try {
    await Lock.updateOne(
      { _id: "questions" },
      { $setOnInsert: { until: new Date(0) } },
      { upsert: true },
    );
  } catch (e) {
    if (e.code !== 11000) throw e;
  }
  const owner = randomUUID();
  const lock = await Lock.findOneAndUpdate(
    { _id: "questions", until: { $lt: new Date() } },
    { $set: { owner, until: new Date(Date.now() + 240000) } },
    { returnDocument: "after" },
  );
  if (!lock) throw Error("Another indexing process owns the lease");
  let indexed = 0;
  try {
    const filter = process.argv.includes("--all")
      ? {}
      : {
          $or: [
            { indexedRevision: { $exists: false } },
            { $expr: { $ne: ["$indexRevision", "$indexedRevision"] } },
          ],
        };
    for await (const q of Question.find(filter).cursor()) {
      const renewed = await Lock.updateOne(
        { _id: "questions", owner, until: { $gt: new Date() } },
        { $set: { until: new Date(Date.now() + 240000) } },
      );
      if (!renewed.modifiedCount) throw Error("Index lease lost");
      const response = await fetch(`${config.AI_SERVICE_URL}/index`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.AI_SERVICE_TOKEN}`,
        },
        body: JSON.stringify({
          id: String(q._id),
          text: `${q.title}\n${q.description}\n${q.expectedConcepts.join(" ")}`,
          metadata: {
            status: q.status,
            difficulty: q.difficulty,
            topics: q.topics.map(String),
            companies: q.companies.map(String),
            roles: q.roles,
          },
          deleted: q.status !== "published",
        }),
        signal: AbortSignal.timeout(180000),
      });
      if (!response.ok)
        throw Error(
          `Indexing failed (${response.status}); rerun to retry pending records`,
        );
      await Question.updateOne(
        { _id: q._id, indexRevision: q.indexRevision },
        { $set: { indexedRevision: q.indexRevision } },
      );
      indexed++;
    }
    console.log(`Indexed ${indexed} questions`);
  } finally {
    await Lock.updateOne(
      { _id: "questions", owner },
      { $set: { until: new Date(0) } },
    );
    await mongoose.disconnect();
  }
}
run().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
  mongoose.disconnect();
});
