# HTTP API

Base path `/api/v1`. JSON requests and responses. Errors: `{success:false,message,requestId}`. Validation 400, authentication 401, authorization 403, missing resource 404, conflict 409, unavailable dependency 503. Internal exceptions never expose stack traces.

## Sessions
- `POST /users/register`: name, email, password (10–72 characters), optional city/preferredRole. Creates account and session.
- `POST /users/login`: email/password. Returns user and csrfToken; sets HttpOnly SameSite=Lax cookie.
- `GET /users/profile`: current user and csrfToken. `PATCH`: allowlisted name/city/preferredRole.
- `POST /users/logout`: revokes current session.
- `POST /users/profile/photo`: multipart `profilePhoto`, maximum 2 MB PNG/JPEG/WebP; Cloudinary required.
- `/users` GET and `/users/:id` PUT/DELETE remain admin-only.

Cookie-authenticated writes require `x-csrf-token` obtained from login/profile. Browser calls use a same-origin Next.js proxy. Nonbrowser clients can request `x-auth-mode: bearer` at login to receive a session-backed bearer token. Old stateless tokens are deliberately invalidated; users sign in again. Registration now uses JSON; avatar upload is a separate authenticated operation.

## Content
- `GET /questions/search`: q, semantic=true|false, difficulty, topics (ID), companies (ID), roles, sort=newest|oldest|title, page. Fixed 20 results/page. Response includes total and mode (keyword, semantic, keyword-fallback).
- `GET /questions`: redirects to search, preserving query parameters.
- `GET /questions/:id`: published detail.
- `POST /questions`, `PUT/DELETE /questions/:id`: admin-only; delete archives and queues vector removal through revision tracking.
- `GET /admin/questions`: admin listing including drafts, currently bounded to 100.
- `POST/DELETE /questions/:id/bookmark`, `GET /bookmarks`: current user's saved questions.
- `/topics` and `/companies`: public GET list/detail, admin POST/PUT/DELETE. Referenced taxonomy cannot be deleted.
- `GET /analytics/users-by-city`: admin-only.
- `GET /insights`: owner-specific topic averages, rule-based recommendations and practice questions.

Question writes accept title, slug, description, difficulty (Easy/Medium/Hard), topic/company IDs, roles, expectedConcepts, rubric, status, attribution and optional platform/link. Unknown fields and MongoDB operators are rejected.

## Interviews
- `POST /interviews`: role, difficulty, type, topics[], questionCount (1–10). Returns a durable created session before inference.
- `GET /interviews`: latest 100 owned sessions. `GET /interviews/:id`: complete owned state/report.
- `POST /interviews/:id/start`: generate first question.
- `POST /interviews/:id/answers`: answer (1–8000 chars), UUID key, version. Stores the answer atomically, then generates a next question or final report. Replaying a key does not duplicate an answer.
- `POST /interviews/:id/retry`: retries a saved failed/interrupted operation; a live lease returns conflict.
- `POST /interviews/:id/complete`: evaluate answered questions early.
- `POST /interviews/:id/cancel`: cancels lifecycle and aborts a locally running provider call.

All interview routes require ownership even for admins. AI failures leave recoverable state, not fabricated feedback. Current responses are bounded JSON operations, not token streams. Clients reload state after a request failure.

## Internal AI service
FastAPI serves OpenAPI at `/openapi.json` and interactive docs at `/docs`. `/turn`, `/evaluate`, `/index`, `/search` require the private service bearer token. The browser never receives it. `/health` is liveness only. Express `/ready` checks MongoDB; AI/vector outages degrade features rather than disabling question browsing.
