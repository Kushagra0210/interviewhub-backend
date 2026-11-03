const response = {
  description: "JSON response; see docs/API.md for resource shapes",
};
const secured = { security: [{ session: [] }, { bearer: [] }] };
const object = (properties, required = []) => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});
const string = { type: "string" };
const schemas = {
  Credentials: object(
    {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 1, maxLength: 72 },
    },
    ["email", "password"],
  ),
  Registration: object(
    {
      name: string,
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 10, maxLength: 72 },
      city: string,
      preferredRole: string,
    },
    ["name", "email", "password"],
  ),
  InterviewSetup: object(
    {
      role: {
        type: "string",
        enum: [
          "Software Development Engineer",
          "Frontend Engineer",
          "Backend Engineer",
          "Full-Stack Engineer",
          "AI/ML Engineer",
          "Applied AI / GenAI Engineer",
        ],
      },
      difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
      type: {
        type: "string",
        enum: [
          "DSA",
          "Web Development",
          "Backend Engineering",
          "Core CS",
          "Machine Learning",
          "GenAI / LLM Engineering",
          "Mixed Technical",
        ],
      },
      topics: { type: "array", items: string, maxItems: 8 },
      questionCount: { type: "integer", minimum: 1, maximum: 10 },
    },
    ["role", "difficulty", "type"],
  ),
  Answer: object(
    {
      answer: { type: "string", minLength: 1, maxLength: 8000 },
      key: { type: "string", format: "uuid" },
      version: { type: "integer", minimum: 0 },
    },
    ["answer", "key", "version"],
  ),
};
const paths = {};
function add(path, method, summary, schema, auth = true) {
  paths[path] ||= {};
  paths[path][method] = {
    summary,
    ...(auth ? secured : {}),
    responses: {
      200: response,
      400: { description: "Validation error" },
      401: { description: "Authentication required" },
      403: { description: "Forbidden" },
      409: { description: "Conflict" },
      503: { description: "Dependency unavailable" },
    },
    ...(schema
      ? {
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: `#/components/schemas/${schema}` },
              },
            },
          },
        }
      : {}),
    ...(path.includes("{id}")
      ? {
          parameters: [
            { in: "path", name: "id", required: true, schema: string },
          ],
        }
      : {}),
  };
}
add(
  "/users/register",
  "post",
  "Register and create session",
  "Registration",
  false,
);
add("/users/login", "post", "Sign in", "Credentials", false);
add("/users/profile", "get", "Current profile and CSRF token");
add("/users/profile", "patch", "Update own profile");
add("/users/logout", "post", "Revoke current session");
for (const kind of ["questions", "topics", "companies"]) {
  add(`/${kind}`, "get", `List ${kind}`, null, false);
  add(`/${kind}`, "post", `Create ${kind} (admin)`);
  for (const method of ["get", "put", "delete"])
    add(`/${kind}/{id}`, method, `${method} ${kind}`, null, method !== "get");
}
add("/questions/search", "get", "Keyword or semantic search", null, false);
add("/bookmarks", "get", "Saved questions");
add("/questions/{id}/bookmark", "post", "Bookmark question");
add("/questions/{id}/bookmark", "delete", "Remove bookmark");
add("/interviews", "get", "List owned sessions");
add("/interviews", "post", "Create interview", "InterviewSetup");
add("/interviews/{id}", "get", "Get owned session and report");
for (const op of ["start", "retry", "complete", "cancel"])
  add(`/interviews/{id}/${op}`, "post", `${op} interview`);
add("/interviews/{id}/answers", "post", "Idempotently submit answer", "Answer");
add("/insights", "get", "Topic performance and recommendations");
module.exports = {
  openapi: "3.1.0",
  info: {
    title: "AI Interview Hub API",
    version: "1.0.0",
    description:
      "Cookie writes require x-csrf-token from login/profile. Read docs/API.md for compatibility and resource contracts.",
  },
  servers: [{ url: "/api/v1" }],
  paths,
  components: {
    schemas,
    securitySchemes: {
      session: { type: "apiKey", in: "cookie", name: "session" },
      bearer: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
};
