const jwt = require('jsonwebtoken');
const { AuthenticationError, AuthorizationError } = require('./errorHandling');

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      throw new AuthenticationError('Access denied. Token missing.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded info to request
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      next(new AuthenticationError('Invalid token. Please log in again.'));
    } else if (err.name === 'TokenExpiredError') {
      next(new AuthenticationError('Your token has expired. Please log in again.'));
    } else {
      next(err);
    }
  }
}

function isAdmin(req, res, next) {
  if (!req.user) {
    throw new AuthenticationError('Access denied. Please log in.');
  }

  if (req.user.role !== 'admin') {
    throw new AuthorizationError('Access denied. Admin privileges required.');
  }

  next();
}

module.exports = {
  authenticateToken,
  isAdmin
};
