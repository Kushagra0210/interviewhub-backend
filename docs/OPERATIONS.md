# Development, security and deployment

## Environment reference
| Variable | Purpose |
|---|---|
| MONGO_URI | API/indexer MongoDB connection; use a dedicated database and least-privilege user |
| JWT_SECRET | At least 32 random characters; signing key, never exposed to web |
| AI_SERVICE_TOKEN | Distinct 32+ character service token shared by API and FastAPI |
| WEB_ORIGIN | Exact browser origin, default http://localhost:3000 |
| PORT | API port, default 4000 |
| AI_SERVICE_URL | Private FastAPI URL |
| API_URL | Next.js server-side API upstream; configured at build for standalone deployment |
| LLM_PROVIDER | ollama or compatible |
| LLM_BASE_URL | Ollama base or hosted compatible API base (including /v1 where required) |
| LLM_MODEL | Chat model; default qwen3:0.6b |
| LLM_API_KEY | Hosted provider secret, never NEXT_PUBLIC |
| EMBEDDING_MODEL | Embedding model, default nomic-embed-text |
| EMBEDDING_DIMENSIONS | Expected vector length, default 768 |
| QDRANT_URL / QDRANT_API_KEY | Private vector endpoint and optional credential |
| QDRANT_COLLECTION | Logical collection prefix; model/dimension hash appended |
| CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET | Optional profile photo storage |

## Existing database migration
Back up with mongodump to a protected location and verify restoration to a separate database. `node scripts/migrate.js` reports changes without writing; `--apply` adds publication/index defaults only to legacy questions missing them. Existing IDs, descriptions, links and password hashes are preserved. No automatic destructive migration runs at startup. Seeding uses insert-only upserts. Roll back code independently; additive fields can remain. Do not remove collections to reset the app.

## Security posture
- bcrypt hashes, HttpOnly cookies, SameSite=Lax, Secure in production, revocable sessions, CSRF token and origin checks.
- Strict body schemas, bounded payloads/searches, allowlisted updates, server-side admin/ownership checks, escaped keyword search.
- No static upload directory. Authenticated bounded image uploads validate signatures and re-encode via Cloudinary.
- Request logs omit bodies, auth headers and query text. Internal errors return generic messages and correlation IDs.
- AI instructions are server-owned and outputs schema-validated. User text remains untrusted. Prompt injection is not claimed to be completely solved.
- No code execution, no browser API keys and no successful fake inference in production.
- Local Compose databases are unauthenticated but bound to loopback. Do not expose that configuration publicly.

## Deployment preparation
The deployment target remains local-first. No paid services are provisioned. For a future public release, obtain provider/budget approval and verify then-current capabilities/pricing. Deploy web, API and AI containers on a private network; use managed MongoDB/Qdrant or durable backed-up volumes. Configure hosted inference for public uptime, TLS, exact origin, NODE_ENV=production and separate secrets. Do not use a small CPU instance for a large model.

Run additive migration dry-run and backup, apply only reviewed changes, seed original content, index, and smoke-test registration/login/logout, owner isolation, a real interview/report, restart persistence and semantic search. Check /ready and AI health separately. Configure upstream request timeout above 180 seconds for synchronous AI calls. Do not enable automatic deploy until checks pass on the target platform.

Single-instance in-memory rate limiting must become distributed before horizontally scaling. Cancellation aborts the current API instance's provider call; cross-instance cancellation still prevents state overwrite but may not stop provider billing immediately.

## Troubleshooting
- Missing Docker engine: the CLI alone cannot run Compose. Start/install the engine or run services directly. Never claim container verification from `compose config` alone.
- MongoDB test download timeout: allow mongodb-memory-server's first binary download to complete, then rerun tests. No production database is used.
- AI unavailable: verify Ollama is running, required model is pulled, URL is reachable from the service, and both internal tokens match. Retry the saved interview operation after its lease expires if a process crashed.
- Browser cookie failures: use one origin and the same-origin proxy; production requires HTTPS. Reauthenticate after changing signing secret or revoking sessions.
- Search falls back: verify Qdrant, embedding model/dimensions and indexer. Run `npm run index -- --all` after changing embedding configuration. Do not reuse incompatible collections.
- AI schema failure: retry is bounded; inspect model/prompt version and use the evaluation cases. The small default model is for local feasibility, not benchmarked assessment accuracy.

## Test strategy
Vitest/Supertest exercises a real disposable MongoDB instance. Pytest uses HTTP transport fixtures for provider errors and schema behavior. Playwright starts a dedicated isolated fixture API; no production environment switch enables those fixtures. Optional live checks use Ollama and temporary Qdrant data. CI runs deterministic tests only. See STATUS for executed evidence rather than assuming configured checks passed remotely.
