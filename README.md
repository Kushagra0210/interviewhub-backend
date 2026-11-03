# AI Interview Hub

An interview-preparation application built on the original Express/Mongoose project, with Next.js, a FastAPI inference service, Ollama, and Qdrant. Includes original practice questions, revocable authentication, persistent interview sessions, structured feedback, bookmarks, history, progress charts and admin content management.

**Verification and limitations:** see [STATUS](docs/STATUS.md). This is local-first; no public deployment URL is claimed.

## Start locally

Prerequisites: Node 24+, Python 3.14, MongoDB, Ollama, and Qdrant (or Docker for the infrastructure).

1. `npm ci` and `npm --prefix apps/web ci`.
2. Copy `.env.example` to an ignored `.env` only if you do not already have one. Configure MongoDB and two distinct random secrets for JWT and internal service authentication. Never overwrite existing credentials.
3. `python -m venv .venv`; install `apps/ai-service/requirements.txt` with that environment's pip.
4. `ollama pull qwen3:0.6b` and `ollama pull nomic-embed-text`. The small chat model is a CPU-friendly smoke-test default, not a claim of high evaluation quality. Change `LLM_MODEL` for better hardware.
5. Start MongoDB and Qdrant, then run `npm run seed`. Existing content is not overwritten.
6. From the repository root: `.venv\Scripts\python -m uvicorn main:app --app-dir apps/ai-service --port 8000` on Windows (use `.venv/bin/python` elsewhere).
7. In separate terminals: `npm start`, `npm --prefix apps/web run dev`, and `npm run index`. Re-run indexing after edits, or use the Compose indexer for automatic reconciliation.
8. Open `http://localhost:3000`, register, and start a session. To manage content, promote an existing account with `node scripts/admin.js your-email`.

## Docker

Set secrets in `.env`. For host Ollama, set `LLM_BASE_URL=http://host.docker.internal:11434` rather than localhost. Then:

```sh
docker compose up --build -d
docker compose exec api npm run seed
docker compose exec api npm run index
```

Named volumes preserve MongoDB and Qdrant. Never use `down -v` against valuable data. This Compose file binds ports to loopback and is for local development. Production requires TLS, private service networking, managed credentials and the deployment checklist.

## Verify

```sh
npm run lint
npm test
npm --prefix apps/web run typecheck
npm --prefix apps/web run build
python -m pytest apps/ai-service -q
ruff check apps/ai-service
npx playwright install chromium
npx playwright test
npm audit --omit=dev --audit-level=high
```

Use the Python virtual environment for Python commands. API tests use an isolated real MongoDB process; its first binary download can take several minutes. E2E tests start isolated API/web servers with explicitly injected AI fixtures; production never imports those fixtures. Live semantic verification: `python apps/ai-service/smoke_search.py` uses real Ollama embeddings and temporary embedded Qdrant storage.

## Structure and documentation

- `src/`, `server.js`: Express, Mongoose, validation, authorization and interview lifecycle.
- `apps/web`: strict TypeScript Next.js UI.
- `apps/ai-service`: provider adapters, prompts, schemas and vector operations.
- `scripts`: additive migration, repeatable seed, admin promotion and indexing.
- `tests`: API integration and Playwright journeys.
- [Architecture](docs/ARCHITECTURE.md), [API](docs/API.md), [Operations](docs/OPERATIONS.md), [Interview guide](INTERVIEW_GUIDE.md), [Implementation ledger](docs/IMPLEMENTATION_PLAN.md).
