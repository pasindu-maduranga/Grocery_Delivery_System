const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────────────────────────────────────────
//  PROTECT — verifies JWT and attaches user to req
//  Used on all routes that require a logged-in user
// ─────────────────────────────────────────────────────────────────────────────

const protect = (req, res, next) => {
  try {
    // 1. check Authorization header exists and starts with Bearer
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied',
      });
    }

    // 2. extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token missing, authorization denied',
      });
    }

    // 3. verify token with shared secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. attach decoded user info to request object
    //    req.user is now available in every controller and middleware after this
    req.user = {
      id:    decoded.id,
      email: decoded.email,
      role:  decoded.role,
    };

    next();
  } catch (err) {
    // handles both expired and invalid tokens
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired, please login again',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token, authorization denied',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  REQUIRE ROLE — restricts route to specific roles
//  Usage in routes: requireRole('admin')
//                   requireRole('restaurant', 'admin')
//                   requireRole('rider', 'admin')
// ─────────────────────────────────────────────────────────────────────────────

const requireRole = (...roles) => {
  return (req, res, next) => {
    // protect() must run before requireRole()
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Allowed roles: ${roles.join(', ')}`,
        yourRole: req.user.role,
      });
    }

    next();
  };
};

module.exports = { protect, requireRole };