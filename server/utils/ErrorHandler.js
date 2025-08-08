export const ErrorHandler = (statusCode, message) => {
  let error = new Error();
  error.statusCode = statusCode;
  error.message = message;
  return error;
};

