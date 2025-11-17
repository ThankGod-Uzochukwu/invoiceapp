// src/middleware/errorHandler.js

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 * Handles all errors thrown in the application
 */
function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error for debugging
  console.error('Error occurred:', {
    message: error.message,
    statusCode: error.statusCode || 500,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });

  // Mongoose/MongoDB duplicate key error
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join(', ');
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }

  // Appwrite errors
  if (err.code && err.code >= 400 && err.code < 600) {
    error.statusCode = err.code;
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: error 
    })
  });
}

/**
 * Handle 404 - Not Found
 */
function notFoundHandler(req, res, next) {
  const error = new AppError(`Route ${req.method} ${req.path} not found`, 404);
  next(error);
}

/**
 * Async handler wrapper to catch errors in async functions
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler
};
