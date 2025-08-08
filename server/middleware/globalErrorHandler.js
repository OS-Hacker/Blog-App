export const globalErrorHandler = (err, req, res, next) => {
  err.message = err.message || "internal server Error";
  err.statusCode = err.statusCode || 500;

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};


export const notFoundError = (error, req, res, next) => {
  let error = new Error(
    `cannot find the route for ${req.originalUrl} at the server`
  );
};

