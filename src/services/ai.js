const { HttpError } = require("../utils/http");
module.exports = async function ai(req, path, body, signal) {
  if (req.app.locals.ai) return req.app.locals.ai(path, body);
  const config = req.app.locals.config;
  try {
    const response = await fetch(`${config.AI_SERVICE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.AI_SERVICE_TOKEN}`,
      },
      body: JSON.stringify(body),
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(180000)])
        : AbortSignal.timeout(180000),
    });
    if (!response.ok) throw new Error("AI request failed");
    return await response.json();
  } catch {
    throw new HttpError(
      503,
      "AI service unavailable. Your progress is saved; retry shortly.",
    );
  }
};
