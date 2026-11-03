const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const pinoHttp = require("pino-http");
const { randomUUID } = require("crypto");
const mongoose = require("mongoose");
const { rateLimit } = require("express-rate-limit");
const { HttpError } = require("./utils/http");
module.exports = function createApp(config, options = {}) {
  const app = express();
  app.locals.config = config;
  app.locals.ai = options.ai;
  app.disable("x-powered-by");
  app.use(
    pinoHttp({
      level: config.NODE_ENV === "test" ? "silent" : "info",
      genReqId: () => randomUUID(),
      serializers: {
        req: (req) => ({
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    }),
  );
  app.use((req, res, next) => {
    res.set("x-request-id", req.id);
    next();
  });
  app.use(helmet());
  app.use(cors({ origin: config.WEB_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "64kb" }));
  app.use(cookieParser());
  app.use(
    "/api",
    rateLimit({
      windowMs: 60000,
      limit: 180,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.use((req, _res, next) => {
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.get("origin") &&
      req.get("origin") !== config.WEB_ORIGIN
    )
      return next(new HttpError(403, "Origin not allowed"));
    next();
  });
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/openapi.json", (_req, res) => res.json(require("./openapi")));
  app.get("/ready", (_req, res) =>
    res
      .status(mongoose.connection.readyState === 1 ? 200 : 503)
      .json({ database: mongoose.connection.readyState === 1 }),
  );
  app.use("/api/v1/users", require("./routes/auth"));
  app.use("/api/v1", require("./routes/content"));
  app.use("/api/v1/interviews", require("./routes/interviews"));
  app.use("/api/v1/insights", require("./routes/insights"));
  app.use((_req, _res, next) => next(new HttpError(404, "Route not found")));
  app.use(require("./utils/errorHandler"));
  return app;
};
