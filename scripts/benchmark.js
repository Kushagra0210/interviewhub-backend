// Repeatable local-only benchmark using disposable seeded MongoDB.
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");
const { randomBytes } = require("crypto");
async function main() {
  const db = await MongoMemoryServer.create();
  try {
    await mongoose.connect(db.getUri());
    await require("./seed")();
    const app = require("../src/app")({
      NODE_ENV: "test",
      JWT_SECRET: randomBytes(32).toString("hex"),
      WEB_ORIGIN: "http://localhost:3000",
    });
    const samples = [];
    for (let i = 0; i < 55; i++) {
      const start = performance.now();
      const r = await request(app).get("/api/v1/questions/search?q=hash");
      if (r.status !== 200) throw Error("Benchmark request failed");
      if (i >= 5) samples.push(performance.now() - start);
    }
    samples.sort((a, b) => a - b);
    console.log(
      JSON.stringify(
        {
          date: new Date().toISOString(),
          node: process.version,
          platform: process.platform,
          corpus: 96,
          samples: samples.length,
          concurrency: 1,
          p50ms: +samples[24].toFixed(2),
          p95ms: +samples[47].toFixed(2),
          note: "Local Supertest HTTP + disposable MongoDB; excludes AI and remote network. Not a production capacity claim.",
        },
        null,
        2,
      ),
    );
  } finally {
    await mongoose.disconnect();
    await db.stop();
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
