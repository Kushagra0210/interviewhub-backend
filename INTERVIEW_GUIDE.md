# Explaining AI Interview Hub

## Three-minute demo
**0:00–0:30:** Introduce the problem: technical preparation needs practice explaining reasoning, not just reading answers. Show the dashboard and the original question library.

**0:30–1:30:** Choose a role/topic, start an interview, and explain an answer. Show that a reload retains server state. Mention idempotency keys prevent duplicate submissions and that provider failures leave recoverable state.

**1:30–2:15:** Complete the session and review the saved rubric-based report. Explain that schema validation guarantees shape, not correctness, and scores are practice guidance.

**2:15–2:45:** Search for a paraphrase such as a moving range of elements. Explain embeddings, metadata filtering, Qdrant ranking, MongoDB hydration and explicit keyword fallback.

**2:45–3:00:** Show executed test results and describe one limitation honestly: small local model quality, nonstreaming generation, or unverified deployment.

## Design questions
1. **Why Express?** Preserve the existing backend and familiar middleware model; avoid a framework rewrite unrelated to product behavior.
2. **Why MongoDB?** Existing operational data is already there. Bounded embedded interview turns support atomic acceptance of an answer without a distributed transaction.
3. **Why FastAPI?** Keep provider prompts, Pydantic output validation and vector integration separate from user authorization/business state.
4. **Authentication?** bcrypt plus signed JWT identifiers backed by revocable database sessions. Browser cookies are HttpOnly and writes require CSRF tokens.
5. **Context?** The API sends persisted bounded turns, role, difficulty and topics. A browser reload does not lose the authoritative conversation.
6. **Duplicate submissions?** Client UUID plus version-checked atomic database update. A replay returns saved state; competing turns cannot both win.
7. **Semantic search?** Text maps to numeric vectors representing semantic similarity. Qdrant finds nearby questions; MongoDB rechecks visibility.
8. **Why embeddings?** They can match paraphrases without exact keyword overlap. Relevance still needs labeled examples and testing.
9. **Why Qdrant?** Vector ranking and metadata filtering are its job; operational records stay in MongoDB.
10. **Evaluate output?** Validate JSON against schemas, apply a documented weighted rubric, retain model/prompt version, and test varied answer quality separately.
11. **Reduce hallucinations?** Constrain scope and output, use explicit rubrics, accept alternatives, and disclose uncertainty. These controls do not eliminate hallucinations.
12. **Provider failures?** Bounded retries/timeouts, durable operation leases, visible errors and manual recovery. Never generate fake feedback.
13. **Deployment?** Docker configuration and CI are supplied. State actual verification from STATUS; do not imply a public deployment exists.
14. **Scale?** Horizontally scale stateless HTTP handling, distribute rate limits/cancellation, move inference to dedicated workers, and measure bottlenecks first.
15. **10,000 concurrent users?** Add admission control, durable queues, token budgets, load tests, connection-pool sizing, index analysis and inference capacity planning. The current single-process limits are not designed for that load.
16. **Trade-offs?** Simpler synchronous JSON generation versus token streaming; Mongo-backed indexing versus adding Redis; model portability versus provider-specific features.
17. **Limitations?** Small-model content quality, limited corpus/evaluation evidence, bounded lists, and independently unverified hosted/container deployment.
18. **Built versus reused?** Application lifecycle, authorization, prompts, indexing reconciliation and UI flows are project code. Express, Mongoose, Next.js, React, Qdrant, Ollama and testing tools supply frameworks and infrastructure.

## Resume wording
Use only claims confirmed in docs/STATUS.md. Suitable feature-focused bullets:
- Built a full-stack interview-practice application using Next.js, Express, MongoDB and FastAPI, with revocable authentication and persistent AI interview reports.
- Implemented version-checked, idempotent answer submission and recoverable provider operations, validated through database integration tests.
- Integrated Ollama embeddings and Qdrant retrieval with publication filtering, versioned collections and explicit keyword fallback.

Do not claim user counts, model accuracy, speedups, scale or public deployment without separate measured evidence.
