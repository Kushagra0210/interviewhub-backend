require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const Topic = require("../src/models/Topics");
const Question = require("../src/models/Question");
const bank = {
  DSA: [
    "sliding window for longest unique substring",
    "binary search on a sorted event timeline",
    "hash table collisions in a frequency counter",
    "breadth-first search for shortest unweighted routes",
    "two pointers for a sorted pair sum",
    "dynamic programming for minimum coin count",
  ],
  JavaScript: [
    "event loop ordering with promises and timers",
    "closures in a debounced search handler",
    "prototype lookup and own properties",
    "reference equality in nested objects",
    "async cancellation with AbortController",
    "error propagation through async functions",
  ],
  TypeScript: [
    "discriminated unions for request states",
    "unknown versus any for external JSON",
    "generics for a typed paginated response",
    "type narrowing with user-defined guards",
    "readonly types and runtime mutation",
    "exhaustive checking when adding a new variant",
  ],
  React: [
    "stale closures in an interval effect",
    "stable keys in a reorderable list",
    "controlled inputs and derived state",
    "effect cleanup for racing requests",
    "memoization costs in a small component",
    "accessible focus after a modal closes",
  ],
  "Next.js": [
    "server and client component boundaries",
    "cache invalidation after a content edit",
    "streaming a slow dashboard section",
    "protecting server-only credentials",
    "dynamic route metadata for question pages",
    "handling errors and missing resources",
  ],
  "Node.js": [
    "event loop blocking during JSON processing",
    "backpressure in a large file stream",
    "graceful shutdown with in-flight requests",
    "request correlation across async calls",
    "idempotency for a payment-like submission",
    "validating proxy headers behind a gateway",
  ],
  Databases: [
    "compound indexes for filtered pagination",
    "atomic updates under concurrent writes",
    "references versus embedded documents",
    "unique constraints during concurrent signup",
    "cursor pagination with equal timestamps",
    "backup restoration and migration rollback",
  ],
  "Operating Systems": [
    "process isolation versus threads",
    "deadlock in competing resource locks",
    "virtual memory and page faults",
    "context switching under CPU contention",
    "file descriptors and resource leaks",
    "race conditions in shared state",
  ],
  "Computer Networks": [
    "DNS resolution before an HTTPS request",
    "TCP retransmission and request latency",
    "TLS certificate verification",
    "HTTP caching with conditional requests",
    "CORS preflight versus authentication",
    "load balancing and sticky sessions",
  ],
  "System Design Fundamentals": [
    "rate limiting a public search API",
    "designing a durable task queue",
    "cache invalidation for edited content",
    "designing a URL shortening service",
    "handling duplicate event delivery",
    "capacity planning for bursty traffic",
  ],
  Python: [
    "mutable defaults in function arguments",
    "generators for memory-bounded processing",
    "asyncio tasks and blocking I/O",
    "context managers for cleanup",
    "typing and runtime validation boundaries",
    "exception chaining in service adapters",
  ],
  "Machine Learning": [
    "precision and recall under class imbalance",
    "data leakage during feature preprocessing",
    "cross-validation for temporal data",
    "calibration of predicted probabilities",
    "bias and variance in model selection",
    "monitoring feature drift after deployment",
  ],
  "Deep Learning": [
    "vanishing gradients in deep networks",
    "dropout during training and inference",
    "batch normalization with small batches",
    "overfitting a small image dataset",
    "learning rate schedules and divergence",
    "transfer learning with frozen layers",
  ],
  LLMs: [
    "context windows and truncation policies",
    "temperature and reproducibility limits",
    "structured output validation failures",
    "tool calling and authorization boundaries",
    "token budgets and latency trade-offs",
    "hallucinations in unsupported factual answers",
  ],
  RAG: [
    "chunk size and retrieval precision",
    "embedding model migration and dimensions",
    "metadata filtering in vector search",
    "retrieval evaluation using labeled queries",
    "prompt injection in retrieved documents",
    "citation grounding and missing evidence",
  ],
  "AI Application Engineering": [
    "timeouts and bounded provider retries",
    "idempotent multi-turn session updates",
    "evaluation datasets and rubric versions",
    "cancellation of a running inference request",
    "privacy-safe traces for debugging",
    "fallback behavior during model outages",
  ],
};
const frames = [
  [
    "Explain",
    "Explain the mechanism with a concrete example. Identify one common misconception.",
    "A strong answer explains the mechanism, walks through a correct example, and distinguishes a common misconception.",
  ],
  [
    "Design",
    "Describe an implementation for a small production application. Discuss correctness, trade-offs and a failure case.",
    "Evaluate a concrete implementation, explicit assumptions, trade-offs, and handling of at least one realistic failure.",
  ],
  [
    "Debug",
    "A teammate reports intermittent incorrect behavior in this area. Describe a reproducible investigation and the evidence you would collect.",
    "Look for a falsifiable hypothesis, a reproducible example, useful diagnostics, and validation of the proposed fix.",
  ],
  [
    "Compare",
    "Compare two reasonable approaches. State when each is preferable and what evidence would change your choice.",
    "Accept different valid approaches. Require clear constraints, costs, and an evidence-based selection.",
  ],
  [
    "Verify",
    "Explain how you would test this behavior. Include boundary cases and distinguish unit checks from integration checks.",
    "Look for meaningful assertions, boundary coverage, and tests that expose realistic failure modes.",
  ],
  [
    "Improve",
    "The current solution works on a small example but struggles as usage grows. Identify bottlenecks and propose a measured improvement.",
    "Require measurement before optimization, a plausible bottleneck, a bounded change, and a way to verify correctness and performance.",
  ],
];
const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
async function seed() {
  for (const [name, concepts] of Object.entries(bank)) {
    const topic = await Topic.findOneAndUpdate(
      { slug: slug(name) },
      {
        $setOnInsert: {
          name,
          slug: slug(name),
          description: `Original ${name} practice`,
        },
      },
      { upsert: true, returnDocument: "after" },
    );
    for (let i = 0; i < concepts.length; i++) {
      const [verb, prompt, rubric] = frames[i];
      const concept = concepts[i];
      const roles = [
        "Software Development Engineer",
        ...(["React", "Next.js", "JavaScript", "TypeScript"].includes(name)
          ? ["Frontend Engineer", "Full-Stack Engineer"]
          : [
                "Machine Learning",
                "Deep Learning",
                "LLMs",
                "RAG",
                "AI Application Engineering",
                "Python",
              ].includes(name)
            ? ["AI/ML Engineer", "Applied AI / GenAI Engineer"]
            : ["Backend Engineer", "Full-Stack Engineer"]),
      ];
      await Question.updateOne(
        { slug: `original-${slug(concept)}` },
        {
          $setOnInsert: {
            title: `${verb}: ${concept}`,
            slug: `original-${slug(concept)}`,
            description: `Consider ${concept}. ${prompt}`,
            difficulty: ["Easy", "Medium", "Medium", "Easy", "Medium", "Hard"][
              i
            ],
            topics: [topic._id],
            companies: [],
            roles,
            expectedConcepts: [concept],
            rubric,
            attribution:
              "Original Interview Hub practice; not attributed to an actual company interview",
            status: "published",
            indexRevision: 1,
            indexedRevision: 0,
            platform: "Original",
            platformLink: "",
          },
        },
        { upsert: true },
      );
    }
  }
}
if (require.main === module)
  mongoose
    .connect(process.env.MONGO_URI)
    .then(seed)
    .then(() =>
      console.log(
        "Seed complete: 96 original questions; existing content preserved.",
      ),
    )
    .finally(() => mongoose.disconnect());
module.exports = seed;
