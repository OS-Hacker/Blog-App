export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export const notFoundError = (err, req, res, next) => {
  let error = new Error(
    `cannot find the route for ${req.originalUrl} at the server`
  );
};
