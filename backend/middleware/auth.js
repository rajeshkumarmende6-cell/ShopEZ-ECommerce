const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Read token from headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorHandler('Not authorized to access this resource', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database (excluding password)
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorHandler('User no longer exists', 404));
    }

    next();
  } catch (error) {
    return next(new ErrorHandler('Not authorized to access this resource', 401));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role (${req.user.role}) is not authorized to access this resource`,
          403
        )
      );
    }
    next();
  };
};
