export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export const notFoundError = (err, req, res, next) => {
  let error = new Error(
    `cannot find the route for ${req.originalUrl} at the server`
  );
};
