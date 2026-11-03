import { beforeAll, afterAll, describe, it, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const createApp = require("../src/app.js");
const User = require("../src/models/User.js");

let database, app, user, csrf, admin, adminCsrf, interview;
const report = {
  overallScore: 70,
  technicalCorrectness: 70,
  reasoning: 70,
  communication: 70,
  strengths: ["Clear explanation"],
  weaknesses: ["Edge cases"],
  recommendations: ["Practice boundaries"],
  questionEvaluations: [],
};
beforeAll(async () => {
  database = await MongoMemoryServer.create();
  await mongoose.connect(database.getUri());
  app = createApp(
    {
      NODE_ENV: "test",
      JWT_SECRET: "test-signing-secret-with-32-characters",
      WEB_ORIGIN: "http://localhost:3000",
    },
    {
      ai: async (path) => {
        if (path === "/search") throw Error("offline");
        return path === "/evaluate"
          ? { report, model: "fixture", promptVersion: "test" }
          : {
              question: "Explain a hash table collision.",
              topic: "DSA",
              feedback: "",
              model: "fixture",
              promptVersion: "test",
            };
      },
    },
  );
  user = request.agent(app);
  admin = request.agent(app);
}, 120000);
afterAll(async () => {
  await mongoose.disconnect();
  await database?.stop();
});
describe("real MongoDB API integration", () => {
  it("registers without exposing password; establishes an HTTP-only session", async () => {
    const r = await user
      .post("/api/v1/users/register")
      .send({
        name: "Student",
        email: "student@example.com",
        password: "strong-password-123",
      });
    expect(r.status).toBe(201);
    expect(r.body.user.password).toBeUndefined();
    expect(r.headers["set-cookie"][0]).toContain("HttpOnly");
    csrf = r.body.csrfToken;
  });
  it("rejects privilege escalation, invalid credentials and unauthenticated reads", async () => {
    expect(
      (
        await request(app)
          .post("/api/v1/users/register")
          .send({
            name: "Attacker",
            email: "bad@example.com",
            password: "strong-password-123",
            role: "admin",
          })
      ).status,
    ).toBe(400);
    expect(
      (
        await request(app)
          .post("/api/v1/users/login")
          .send({ email: "student@example.com", password: "wrong-password" })
      ).status,
    ).toBe(401);
    expect((await request(app).get("/api/v1/users/profile")).status).toBe(401);
  });
  it("enforces CSRF, origin and admin authorization", async () => {
    expect(
      (await user.patch("/api/v1/users/profile").send({ name: "New" })).status,
    ).toBe(403);
    expect(
      (
        await user
          .patch("/api/v1/users/profile")
          .set("x-csrf-token", csrf)
          .set("Origin", "https://evil.test")
          .send({ name: "New" })
      ).status,
    ).toBe(403);
    expect((await user.get("/api/v1/analytics/users-by-city")).status).toBe(
      403,
    );
  });
  it("supports admin question lifecycle and safe search fallback", async () => {
    const r = await admin
      .post("/api/v1/users/register")
      .send({
        name: "Admin",
        email: "admin@example.com",
        password: "strong-password-123",
      });
    adminCsrf = r.body.csrfToken;
    await User.updateOne(
      { email: "admin@example.com" },
      { $set: { role: "admin" } },
    );
    const created = await admin
      .post("/api/v1/questions")
      .set("x-csrf-token", adminCsrf)
      .send({
        title: "Sliding window",
        slug: "sliding-window",
        description: "Maintain a moving range of elements.",
        difficulty: "Easy",
      });
    expect(created.status).toBe(201);
    const id = created.body.question._id;
    const search = await user.get(
      "/api/v1/questions/search?q=window&semantic=true",
    );
    expect(search.body.mode).toBe("keyword-fallback");
    expect(search.body.questions).toHaveLength(1);
    expect(
      (
        await admin
          .put(`/api/v1/questions/${id}`)
          .set("x-csrf-token", adminCsrf)
          .send({ title: "Moving window" })
      ).status,
    ).toBe(200);
    expect(
      (
        await user
          .post(`/api/v1/questions/${id}/bookmark`)
          .set("x-csrf-token", csrf)
      ).status,
    ).toBe(200);
    expect(
      (
        await admin
          .delete(`/api/v1/questions/${id}`)
          .set("x-csrf-token", adminCsrf)
      ).status,
    ).toBe(200);
    expect((await user.get(`/api/v1/questions/${id}`)).status).toBe(404);
  });
  it("validates IDs, taxonomy references, updates and profiles", async () => {
    expect((await user.get("/api/v1/questions/not-an-id")).status).toBe(400);
    expect((await user.get("/api/v1/questions/search?page=-1")).status).toBe(
      400,
    );
    expect(
      (
        await admin
          .post("/api/v1/questions")
          .set("x-csrf-token", adminCsrf)
          .send({
            title: "Bad refs",
            slug: "bad-refs",
            description: "Test",
            difficulty: "Easy",
            topics: ["000000000000000000000001"],
          })
      ).status,
    ).toBe(400);
    let r = await admin
      .post("/api/v1/companies")
      .set("x-csrf-token", adminCsrf)
      .send({ name: "Practice Co", slug: "practice-co" });
    expect(r.status).toBe(201);
    const id = r.body.company._id;
    expect(
      (
        await admin
          .put(`/api/v1/companies/${id}`)
          .set("x-csrf-token", adminCsrf)
          .send({ description: "Practice classification" })
      ).status,
    ).toBe(200);
    expect(
      (
        await admin
          .delete(`/api/v1/companies/${id}`)
          .set("x-csrf-token", adminCsrf)
      ).status,
    ).toBe(200);
    expect(
      (
        await user
          .patch("/api/v1/users/profile")
          .set("x-csrf-token", csrf)
          .send({ name: "Updated" })
      ).body.user.name,
    ).toBe("Updated");
    expect(
      (
        await user
          .patch("/api/v1/users/profile")
          .set("x-csrf-token", csrf)
          .send({ role: "admin" })
      ).status,
    ).toBe(400);
  });
  it("persists an interview, answer and report; retries cannot duplicate answers", async () => {
    let r = await user
      .post("/api/v1/interviews")
      .set("x-csrf-token", csrf)
      .send({
        role: "Backend Engineer",
        difficulty: "Easy",
        type: "DSA",
        topics: [],
        questionCount: 1,
      });
    expect(r.status).toBe(201);
    interview = r.body.interview._id;
    r = await user
      .post(`/api/v1/interviews/${interview}/start`)
      .set("x-csrf-token", csrf);
    expect(r.status).toBe(200);
    const payload = {
      answer: "Use chaining to store colliding keys in a bucket.",
      key: crypto.randomUUID(),
      version: r.body.interview.version,
    };
    r = await user
      .post(`/api/v1/interviews/${interview}/answers`)
      .set("x-csrf-token", csrf)
      .send(payload);
    expect(r.status).toBe(200);
    expect(r.body.interview.status).toBe("completed");
    r = await user
      .post(`/api/v1/interviews/${interview}/answers`)
      .set("x-csrf-token", csrf)
      .send(payload);
    expect(r.body.interview.turns).toHaveLength(1);
    expect((await admin.get(`/api/v1/interviews/${interview}`)).status).toBe(
      404,
    );
    expect(
      (await user.get(`/api/v1/interviews/${interview}`)).body.interview.report
        .overallScore,
    ).toBe(70);
  });
  it("persists a failed operation and recovers it without losing answers", async () => {
    const original = app.locals.ai;
    let r = await user
      .post("/api/v1/interviews")
      .set("x-csrf-token", csrf)
      .send({
        role: "Backend Engineer",
        difficulty: "Easy",
        type: "DSA",
        topics: [],
        questionCount: 2,
      });
    const id = r.body.interview._id;
    app.locals.ai = async () => {
      throw Error("provider offline");
    };
    expect(
      (
        await user
          .post(`/api/v1/interviews/${id}/start`)
          .set("x-csrf-token", csrf)
      ).status,
    ).toBe(500);
    expect(
      (await user.get(`/api/v1/interviews/${id}`)).body.interview.status,
    ).toBe("failed");
    app.locals.ai = original;
    r = await user
      .post(`/api/v1/interviews/${id}/retry`)
      .set("x-csrf-token", csrf);
    expect(r.body.interview.status).toBe("active");
    const payload = {
      answer: "A collision can use chaining.",
      key: crypto.randomUUID(),
      version: r.body.interview.version,
    };
    const results = await Promise.all([
      user
        .post(`/api/v1/interviews/${id}/answers`)
        .set("x-csrf-token", csrf)
        .send(payload),
      user
        .post(`/api/v1/interviews/${id}/answers`)
        .set("x-csrf-token", csrf)
        .send(payload),
    ]);
    expect(results.some((r) => r.status === 200)).toBe(true);
    r = await user.get(`/api/v1/interviews/${id}`);
    expect(r.body.interview.turns.filter((t) => t.answer)).toHaveLength(1);
    expect(
      (
        await user
          .post(`/api/v1/interviews/${id}/cancel`)
          .set("x-csrf-token", csrf)
      ).body.interview.status,
    ).toBe("cancelled");
    expect(
      (
        await user
          .post(`/api/v1/interviews/${id}/retry`)
          .set("x-csrf-token", csrf)
      ).status,
    ).toBe(409);
  });
  it("revokes logout and supports signing back in with the existing password hash", async () => {
    expect(
      (await user.post("/api/v1/users/logout").set("x-csrf-token", csrf))
        .status,
    ).toBe(200);
    expect((await user.get("/api/v1/users/profile")).status).toBe(401);
    expect(
      (
        await user
          .post("/api/v1/users/login")
          .send({
            email: "student@example.com",
            password: "strong-password-123",
          })
      ).status,
    ).toBe(200);
  });
});
