// Isolated test-only server. Never imported by the production entry point.
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const { randomBytes } = require("crypto");
const createApp = require("../src/app");
const { spawn } = require("child_process");
const path = require("path");
async function main() {
  const db = await MongoMemoryServer.create();
  await mongoose.connect(db.getUri());
  await require("../scripts/seed")();
  const serviceToken = randomBytes(32).toString("hex");
  let aiProcess;
  if (process.env.LIVE_AI === "1") {
    const python =
      process.env.PYTHON_BIN ||
      path.resolve(
        process.platform === "win32"
          ? ".venv/Scripts/python.exe"
          : ".venv/bin/python",
      );
    aiProcess = spawn(
      python,
      [
        "-m",
        "uvicorn",
        "main:app",
        "--app-dir",
        "apps/ai-service",
        "--port",
        "8100",
      ],
      {
        env: { ...process.env, AI_SERVICE_TOKEN: serviceToken },
        stdio: "inherit",
        windowsHide: true,
      },
    );
    let ready = false;
    for (let i = 0; i < 60; i++) {
      try {
        if ((await fetch("http://127.0.0.1:8100/health")).ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
    if (!ready) throw Error("Live AI service did not become ready");
  }
  const app = createApp(
    {
      NODE_ENV: "test",
      JWT_SECRET: randomBytes(32).toString("hex"),
      WEB_ORIGIN: "http://localhost:3000",
      AI_SERVICE_TOKEN: serviceToken,
      AI_SERVICE_URL: "http://127.0.0.1:8100",
    },
    process.env.LIVE_AI === "1"
      ? {}
      : {
          ai: async (path) =>
            path === "/evaluate"
              ? {
                  report: {
                    overallScore: 70,
                    technicalCorrectness: 75,
                    reasoning: 65,
                    communication: 65,
                    strengths: ["Explains the approach"],
                    weaknesses: ["Check empty input"],
                    recommendations: ["Practice boundary cases"],
                    questionEvaluations: [],
                  },
                  model: "test-fixture",
                  promptVersion: "fixture-v1",
                }
              : {
                  question:
                    "How would you find a pair of numbers with a target sum?",
                  topic: "DSA",
                  feedback: "",
                  model: "test-fixture",
                  promptVersion: "fixture-v1",
                },
        },
  );
  const server = app.listen(4100, () =>
    console.log("Isolated E2E API ready on 4100"),
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, () =>
      server.close(async () => {
        aiProcess?.kill();
        await mongoose.disconnect();
        await db.stop();
        process.exit(0);
      }),
    );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
