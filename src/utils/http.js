class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success)
    return next(
      new HttpError(
        400,
        result.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      ),
    );
  req.body = result.data;
  next();
};
module.exports = { HttpError, validate };
