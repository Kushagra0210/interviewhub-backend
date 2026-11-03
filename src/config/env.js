const { z } = require("zod");
module.exports = () =>
  z
    .object({
      NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
      PORT: z.coerce.number().int().min(1).max(65535).default(4000),
      MONGO_URI: z.string().min(1),
      JWT_SECRET: z.string().min(32),
      WEB_ORIGIN: z.url().default("http://localhost:3000"),
      AI_SERVICE_URL: z.url().default("http://127.0.0.1:8000"),
      AI_SERVICE_TOKEN: z.string().min(32),
    })
    .parse(process.env);
