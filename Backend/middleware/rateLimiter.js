const rateLimit = require('express-rate-limit');

// Create a limiter for login attempts
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // 5 attempts per window
    message: {
        message: 'Too many login attempts',
        errors: [{
            field: 'login',
            message: 'Please try again after 1 minute'
        }]
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = {
    loginLimiter
}; 