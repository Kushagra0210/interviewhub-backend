# Implementation status

## Verified locally
- API: eight Vitest/Supertest integration tests passed against disposable MongoDB, including authentication, authorization, content, concurrency, recovery and revocation.
- AI service: nine pytest tests and Ruff passed. Real Ollama qwen3:0.6b returned a schema-valid interview question and a structured evaluation.
- Semantic search: real nomic-embed-text embeddings with temporary embedded Qdrant ranked a paraphrased moving-range query first and verified deletion.
- Browser: two Playwright tests passed with controlled AI fixtures, including registration, search, answer submission, persisted report and reload.
- Next.js type checking and production build passed. API lint and production dependency audit passed with zero advisories. Docker Compose configuration parsed successfully.
- Local benchmark on Windows/Node 24.19: 50 sequential keyword-search samples over 96 seeded questions, after five warmups, p50 22.32 ms and p95 30.86 ms. This uses local Supertest and disposable MongoDB, excludes inference/network, and is not a production capacity claim. Reproduce with `node scripts/benchmark.js`.

## Remaining work and limits
- A full browser-to-real-Ollama interview was started but did not finish during this session; investigate and rerun `npx playwright test --config playwright.live.config.js`. Individual real model question and evaluation calls did pass.
- Docker engine was unavailable; container build, Compose startup and networked Qdrant have not been verified. No public deployment or remote CI run is claimed.
- AI responses currently use synchronous JSON, not token streaming. Provider cancellation is best effort and does not yet guarantee cancellation across service instances.
- Existing auth tokens require sign-in again. Existing JSON and multipart registration clients must migrate to JSON registration and separate authenticated avatar upload. Legacy questions require the documented additive migration before public search/indexing.
- The hosted OpenAI-compatible provider and Cloudinary upload require credentials and have not been tested. The small local model and evaluation rubric have not been validated for assessment quality.
- Admin list/history pagination, API contract completeness, observability, and stronger distributed rate limits require further work before production. The current full dependency audit reports four moderate development-only advisories; production audit is clean.
- No production smoke tests, security penetration test, or evidence of CI passing remotely. Treat this as an incomplete production release, not a verified deployable service.
