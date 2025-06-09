const { body, validationResult } = require('express-validator');

// Login validation middleware
const validateLogin = [
    // Email validation
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),

    // Password validation
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

    // Validation result middleware
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        next();
    }
];

module.exports = {
    validateLogin
}; 