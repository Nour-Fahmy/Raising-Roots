// Custom Error Classes
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
        this.name = 'ValidationError';
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Not authorized to perform this action') {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

// Error Response Formatter
const formatErrorResponse = (err) => {
    return {
        status: err.status,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            error: err
        })
    };
};

// Error Handling Middleware
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        err = new ValidationError(err.message);
    }
    if (err.name === 'JsonWebTokenError') {
        err = new AuthenticationError('Invalid token. Please log in again.');
    }
    if (err.name === 'TokenExpiredError') {
        err = new AuthenticationError('Your token has expired. Please log in again.');
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        err = new ValidationError(`Duplicate field value: ${field}. Please use another value.`);
    }

    // Send error response
    res.status(err.statusCode).json(formatErrorResponse(err));
};

// Async Error Handler Wrapper
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Not Found Handler
const notFoundHandler = (req, res, next) => {
    next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
};

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    errorHandler,
    catchAsync,
    notFoundHandler
}; 