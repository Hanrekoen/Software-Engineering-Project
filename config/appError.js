/**
 * Operational error class. Every error thrown deliberately by the
 * application (validation failure, not found, unauthorized, etc.)
 * should be an AppError so the central error handler can respond
 * consistently and distinguish "expected" errors from bugs.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
 
    Error.captureStackTrace(this, this.constructor);
  }
 
  static badRequest(message = 'Bad request') {
    return new AppError(message, 400);
  }
 
  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401);
  }
 
  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403);
  }
 
  static notFound(message = 'Resource not found') {
    return new AppError(message, 404);
  }
 
  static conflict(message = 'Conflict') {
    return new AppError(message, 409);
  }
 
  static unprocessable(message = 'Unprocessable entity') {
    return new AppError(message, 422);
  }
}
 
module.exports = AppError;