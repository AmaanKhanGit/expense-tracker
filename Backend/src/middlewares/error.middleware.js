function errorHandler(err, req, res, next) {
  res.status(err.statusCode).json({
    message: err.message,
    meta: "this response from central handler",
  });
}

module.exports = { errorHandler };
