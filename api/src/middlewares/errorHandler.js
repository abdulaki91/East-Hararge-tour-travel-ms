export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error
  let error = {
    success: false,
    message: err.message || "Internal Server Error",
    statusCode: err.statusCode || 500,
  };

  // MySQL duplicate entry error
  if (err.code === "ER_DUP_ENTRY") {
    error.message = "Duplicate entry. Resource already exists";
    error.statusCode = 409;
  }

  // MySQL foreign key constraint error
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    error.message = "Referenced resource does not exist";
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.message = "Invalid token";
    error.statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    error.message = "Token expired";
    error.statusCode = 401;
  }

  // Validation errors
  if (err.name === "ValidationError") {
    error.message = "Validation failed";
    error.statusCode = 400;
  }

  // File upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    error.message = "File too large";
    error.statusCode = 400;
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};
