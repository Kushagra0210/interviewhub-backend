# AI Interview Hub implementation ledger

## Architecture
Preserve Express and existing MongoDB collections. Add a Next.js client and an internal FastAPI service. MongoDB owns interview state; Qdrant is a rebuildable index. Ollama is the primary local provider; hosted inference remains configurable. No code execution or paid provisioning.

## Baseline audit
- Login omits the password selected with `select:false`; auth uses undefined `user`.
- Company deletion uses `req.status`; CORS is imported without a dependency.
- Cloudinary initializes before dotenv; server starts before MongoDB readiness.
- Uploads have no size/type bounds. Analytics is public. Queries lack bounds.
- No tests, frontend, AI service, CI or deployment configuration.
- 589 dependency files tracked. Preserve untracked LEARNING_ROADMAP.md.

## Milestones and acceptance
1. Backend stabilization: auth, validation, safe errors, CRUD and automated integration tests.
2. Full stack: accessible auth, question library/admin and persistent user preferences.
3. Interviews: durable idempotent turns, real provider calls, validated saved evaluation.
4. Search: real embeddings, versioned Qdrant index, filtering and keyword fallback.
5. Delivery: Docker, CI, E2E, security checks, documentation and evidence.

## Risks and safeguards
Existing data must never be dropped. Seed only missing original content. Keep existing IDs and password hashes. Auth cookie changes must be documented. Failures must never manufacture successful AI results. Real model tests are separate from deterministic tests. Provider availability and machine resources can block live verification.

## Verification status
Implementation in progress. Docker CLI is installed but daemon was unavailable at baseline. Ollama is available but has no models installed. No live deployment authorized. See STATUS.md for executed checks and remaining work.
