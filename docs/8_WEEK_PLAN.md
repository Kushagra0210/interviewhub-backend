# Interview Hub - 8-Week Learning + Building Plan

## Overview
- **Goal**: Full-stack Interview Hub with 2 standout AI features
- **Timeline**: 8 weeks, 2 hrs/day (10 hrs/week) = 80 hours
- **Stack**: Express + MongoDB + Ollama + Qdrant + FastAPI + React/Vite + Tailwind
- **Deploy**: Railway/Render + Vercel

---

## 🎯 2 AI Features (Locked)
1. **Mock Interview Agent** — Conversational AI interviewer with persona, session state, feedback
2. **Semantic Question Search** — Vector search with hybrid filtering (meaning + metadata)

---

## 📚 Advanced Backend Topics — Interview-Ready Depth

| Topic | What You'll Build | Interview Q&A Coverage |
|-------|-------------------|------------------------|
| **Winston Logging** | Structured JSON logs, request IDs, log levels, transports | *Easy*: Logger basics • *Medium*: Custom transports, context • *Hard*: Correlation IDs, distributed tracing prep |
| **Swagger/OpenAPI** | Full spec for auth, questions, AI endpoints with examples | *Easy*: Annotations • *Medium*: Auth schemes, schemas • *Hard*: Code-first vs design-first, CI integration |
| **Jest + Supertest** | 6 tests: register, login, protected route, question CRUD, AI search, mock interview start | *Easy*: Unit vs integration • *Medium*: Mocking DB, test DB • *Hard*: Coverage, CI, flaky tests, test pyramids |
| **Redis + BullMQ** | Session store for interviews, 1 queue job (embed questions), rate limiter | *Easy*: Key-value, TTL • *Medium*: Pub/sub, streams • *Hard*: Cluster, persistence, queue patterns, backpressure |
| **Config Module (Zod)** | Centralized `config/` with validated env, type-safe access | *Easy*: 12-factor • *Medium*: Schema validation • *Hard*: Feature flags, secrets rotation, multi-env |

---

## 📅 Week-by-Week (80 Hours = 8 Weeks × 10 hrs)

### **WEEK 1: Backend Hardening + Advanced Topics Exposure (Days 1-5)**

| Day | Morning (1 hr) — Learn + Mini-Project | Evening (1 hr) — Apply to Main Project |
|-----|----------------------------------------|----------------------------------------|
| **Mon** | **Error Handling** — `AppError`, `catchAsync`, global handler in fresh app | Wrap all your controllers (`userController`, `companyController`, etc.) |
| **Tue** | **Zod Validation** — Schemas for register, login, question create in isolation | Add to all mutate routes; replace `validateMiddleware.js` |
| **Wed** | **Winston Logging** — Structured logger, request ID middleware, transports | Integrate in `server.js`; log all requests + errors |
| **Thu** | **Config Module** — `config/index.js` with Zod schema, type-safe `config.get()` | Replace all `process.env` usage; validate on startup |
| **Fri** | **Security Basics** — Helmet, CORS, rate-limit, mongo-sanitize, xss-clean | Apply to `server.js`; test with attack payloads |

**Weekend**: Explain all 5 topics to me (15 min each) — I'll ask interview-style questions

---

### **WEEK 2: Docs + Testing + Docker + Deploy + Redis/BullMQ (Days 6-10)**

| Day | Morning (1 hr) | Evening (1 hr) |
|-----|----------------|----------------|
| **Mon** | **Swagger** — Annotate 5 endpoints (register, login, questions CRUD, AI search) | Generate `/api-docs`; verify in browser |
| **Tue** | **Jest + Supertest** — Setup, test DB, 3 tests (register, login, protected route) | Add 3 more tests (question CRUD, AI search stub) |
| **Wed** | **Docker** — Multi-stage Dockerfile, `docker-compose.yml` (MongoDB, backend) | Build, run locally; verify health endpoint |
| **Thu** | **Deploy** — Railway/Render + MongoDB Atlas + GitHub Actions (lint→test→deploy) | Live API; auto-deploy on push |
| **Fri** | **Redis + BullMQ** — Local Redis, session store, 1 queue (embed questions), rate limiter | Integrate session store for interviews; demo queue job |

**Weekend**: Explain Swagger, Testing, Docker, Deploy, Redis/BullMQ — I'll quiz you

---

### **WEEK 3: AI Infrastructure (Days 11-15)**

| Day | Morning (1 hr) | Evening (1 hr) |
|-----|----------------|----------------|
| **Mon** | **Ollama** — Pull `llama3.1:8b`, `nomic-embed-text`, `codellama:7b`; test CLI | Add to `docker-compose.yml`; health check |
| **Tue** | **Qdrant** — Create `questions` collection (768-dim), payload schema, filter examples | Insert 10 test vectors; search via REST |
| **Wed** | **FastAPI Skeleton** — `/health`, `/embed`, `/chat`, `/generate`, `/evaluate-code` stubs | Pydantic models for each endpoint |
| **Thu** | **Implement `/embed` + `/chat`** — Ollama Python client, batch embed, streaming chat | Test from backend via `curl` |
| **Fri** | **Backend → AI Client** — Axios wrapper (timeout, retry, circuit breaker), service module | Call `/embed` from controller; store in Qdrant |

**Weekend**: Embed all existing questions → Qdrant (script); verify search works

---

### **WEEK 4: AI Feature 1 — Mock Interview Agent (Days 16-20)**

| Day | Morning (1 hr) | Evening (1 hr) |
|-----|----------------|----------------|
| **Mon** | **Session Design** — Redis schema: `{sessionId, history[], currentQ, score, persona, startedAt}` | `POST /ai/interview/start` → creates session, returns first question |
| **Tue** | **Interviewer Persona** — System prompt engineering (few-shot, JSON output schema) | `POST /ai/interview/turn` — user answer → LLM → next question/hint |
| **Wed** | **Scoring & Feedback** — LLM evaluates answer (0-10), accumulates, stores | `POST /ai/interview/end` → generates final report (strengths, weaknesses, tips) |
| **Thu** | **Polling Frontend Flow** — Client polls `/turn` every 2s; handles loading, errors | Integrate with backend routes; test full flow |
| **Fri** | **Edge Cases** — Timeout, disconnect, resume session, input validation, cost tracking | Polish; add logging; demo to me |

---

### **WEEK 5: AI Feature 2 — Semantic Question Search (Days 21-25)**

| Day | Morning (1 hr) | Evening (1 hr) |
|-----|----------------|----------------|
| **Mon** | **Hybrid Search Theory** — Vector (semantic) + BM25 (keyword) + metadata filters | Qdrant hybrid query: `fusion` + `filter` (difficulty, company, topic) |
| **Tue** | **Embedding Pipeline** — Batch embed all questions, upsert to Qdrant with payload | Scheduled job (BullMQ) to re-embed on question create/update |
| **Wed** | **Search Endpoint** — `GET /questions/search?q=&semantic=true&difficulty=&company=` | Combine vector results + MongoDB hydration; pagination |
| **Thu** | **Search Quality** — Test cases, relevance tuning, fallback to keyword-only | Add analytics: log queries, results clicked, "no results" |
| **Fri** | **Performance** — Cache frequent searches (Redis), measure latency, optimize | Document API; add to Swagger |

---

### **WEEK 6: React Frontend Core (Days 26-30)**

| Day | Morning (1 hr) | Evening (1 hr) |
|-----|----------------|----------------|
| **Mon** | **Project Setup** — Vite + React + Tailwind + TanStack Query + Axios + Router | Auth context, JWT interceptors, protected routes |
| **Tue** | **Auth Pages** — Register, Login, Profile (forms with RHF + Zod resolver) | Connect to your API; token refresh logic |
| **Wed** | **Question Pages** — List (search, filter, paginate), Detail, Create (admin) | TanStack Query hooks for all question operations |
| **Thu** | **Mock Interview UI** — Chat interface, streaming responses, session state | Polling hook for `/turn`; loading, error, empty states |
| **Fri** | **Semantic Search UI** — Search bar, filters, results cards, "no results" | Debounced search; highlight matches; keyboard nav |

---

### **WEEK 7: Frontend Polish + Integration (Days 31-35)**

| Day | Morning (1 hr) | Evening (1 hr) |
|-----|----------------|----------------|
| **Mon** | **Dashboard** — User stats, recent interviews, recommended questions | Charts (Recharts); AI insights from backend |
| **Tue** | **Admin Panel** — Question CRUD, Company/Topic management, AI generate trigger | Role-based routes; confirm dialogs; bulk actions |
| **Wed** | **AI Generate UI** — Form (topic, difficulty, count) → queue job → poll results | Toast notifications; view generated questions |
| **Thu** | **Responsive + Accessibility** — Mobile nav, focus states, ARIA, color contrast | Lighthouse audit; fix issues |
| **Fri** | **E2E Flow Test** — Register → Search → Interview → Feedback → Dashboard | Bug bash; fix all blockers |

---

### **WEEK 8: Deploy + Demo Prep + Docs (Days 36-40)**

| Day | Morning (1 hr) | Evening (1 hr) |
|-----|----------------|----------------|
| **Mon** | **Frontend Deploy** — Vercel + env vars + custom domain | Verify production build; check API calls |
| **Tue** | **Backend Production Hardening** — Prod env, secrets, CORS, rate limits, health checks | Load test (k6/Artillery); fix bottlenecks |
| **Wed** | **Monitoring** — Sentry (errors), basic metrics, log aggregation | Alert on 5xx; dashboard |
| **Thu** | **Documentation** — README (setup, architecture, AI features), API docs, demo script | Record 3-min demo video |
| **Fri** | **Final Demo** — Live walkthrough to me; I ask interview questions on your stack | Retrospective; plan post-60-day features |

---

## 🧠 Interview Readiness Checkpoints

**Every Friday (30 min)**: You explain that week's topics to me. I ask:
- **Easy**: "What does X do?"
- **Medium**: "Why did you choose X over Y? Tradeoffs?"
- **Hard**: "How would you scale X? What breaks at 10x? How do you debug production issues?"

**Topics Covered by Week 8:**
1. Express architecture, middleware, error handling
2. MongoDB/Mongoose: schemas, indexes, aggregation, population
3. Auth: JWT, refresh tokens, bcrypt, RBAC
4. Validation: Zod, schema design
5. Logging: Winston, structured logs, correlation IDs
6. Config: 12-factor, Zod validation, secrets
7. API Docs: OpenAPI, Swagger, CI integration
8. Testing: Jest, Supertest, test pyramid, mocking
9. Docker: Multi-stage, compose, health checks
10. Deploy: CI/CD, cloud platforms, env management
11. Redis: Data structures, TTL, pub/sub, streams
12. BullMQ: Queues, workers, retries, backpressure
13. Vector DB: Qdrant, embeddings, hybrid search, filtering
14. LLMs: Ollama, prompt engineering, streaming, personas
15. AI Patterns: RAG, agents, evaluation, cost tracking
16. React: Hooks, TanStack Query, forms, state management
17. Frontend Deploy: Vercel, env, builds, performance

---

## 📋 Quick Reference: Weekly Structure

**Each week (10 hrs = 5 days × 2 hrs):**

| Day | Activity |
|-----|----------|
| Mon | **Learn + Mini-project** (isolated, guided) — 2 hrs |
| Tue | **Integrate to main project** — 2 hrs |
| Wed | **Integrate + Edge cases** — 2 hrs |
| Thu | **Test end-to-end + Fix bugs** — 2 hrs |
| Fri | **Retro (15 min) + Buffer/Deepen** — 1.75 hrs |

**Weekend**: Explain concepts to me (30 min) — I quiz you at interview level

---

## 🔧 Tech Stack (Locked)

| Layer | Choice |
|-------|--------|
| Backend | Express (JS) — your current code |
| Database | MongoDB Atlas (free tier) |
| Vector DB | Qdrant (Docker) |
| LLM Runtime | Ollama (local, Docker) |
| AI Service | Python FastAPI (separate container) |
| Code Execution | Piston API (free, no sandbox needed) |
| Frontend | React + Vite + TanStack Query + Tailwind |
| Deploy | Railway/Render (backend) + Vercel (frontend) |

---

## ⚡ Compressed Backend Essentials (Week 1 Only)

| Task | Time | Notes |
|------|------|-------|
| `AppError` + `catchAsync` wrapper | 1 hr | Copy pattern, apply to all controllers |
| Zod schemas for all mutate endpoints | 2 hrs | Register, login, question CRUD, company CRUD |
| Helmet + CORS + rate-limit (basic) | 1 hr | Sensible defaults |
| Multi-stage Dockerfile + compose | 2 hrs | Backend + MongoDB + (later) Ollama/Qdrant |
| Deploy to Railway/Render + MongoDB Atlas | 2 hrs | Live API |
| GitHub Actions: lint → build → deploy | 2 hrs | Auto-deploy on push |

**Advanced Topics Exposure (Weeks 1-2):**
- Winston Logging: 1 hr
- Swagger/OpenAPI: 1.5 hrs
- Jest + Supertest: 2 hrs
- Redis + BullMQ: 2 hrs
- Config Module (Zod): 1 hr

---

## 📝 Notes for Future Reference

- **Start Date**: [TO BE FILLED]
- **AI Features Deferred**: Code Evaluation, Resume Analysis, Interview Feedback, Recommendations, Question Generation
- **Post-60-Day**: TypeScript migration, Next.js migration, WebSocket for real-time, Fine-tuning pipeline
- **Pen Drive Backup**: Copy `docs/8_WEEK_PLAN.md` to external storage

---

*Plan created: $(date)*
*Repository: interviewhub-backend*
*Branch: feature/interview-hub-plan*