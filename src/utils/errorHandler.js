module.exports = (err, req, res, _next) => {
  const status =
    err.status ||
    (err.code === 11000
      ? 409
      : ["ValidationError", "CastError", "ZodError", "MulterError"].includes(
            err.name,
          )
        ? 400
        : 500);
  req.log?.error({ error: err.name, code: err.code, status }, "request failed");
  res
    .status(status)
    .json({
      success: false,
      message:
        status >= 500
          ? "Service unavailable. Please retry."
          : err.code === 11000
            ? "This record already exists"
            : err.message,
      requestId: req.id,
    });
};
