import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode ? error.statusCode : 500;
    let message = error.message || "Something went wrong";
    
    // Handle Mongoose duplicate key error
    if (err.code === 11000) {
      statusCode = 409;
      message = `Duplicate field value entered: ${Object.keys(err.keyValue).join(', ')}`;
    }
    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
      statusCode = 400;
      message = `Resource not found. Invalid: ${err.path}`;
    }

    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(response);
};

export { errorHandler };
