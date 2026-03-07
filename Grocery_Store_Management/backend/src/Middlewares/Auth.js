const jwt = require('jsonwebtoken');
const SystemUser = require('../models/SystemUser');
const Role = require('../models/Role');

/**
 * ROUTE → SCREEN CODE MAP
 * ─────────────────────────────────────────────────────────────────
 * Maps API route prefixes to the screen code that protects them.
 * When a request comes in, middleware looks up the route here
 * and checks if the user's role has permission for that screen code.
 *
 * HOW TO ADD A NEW ROUTE:
 *   Add an entry: '/api/your-route': 'SCREEN_YOUR_CODE'
 * ─────────────────────────────────────────────────────────────────
 */
const ROUTE_SCREEN_MAP = {
  '/api/system-users': 'SCREEN_USERS',
  '/api/roles': 'SCREEN_ROLES',
  '/api/parent-menus': 'SCREEN_PARENT_MENUS',
  '/api/menus': 'SCREEN_MENUS',
  '/api/screens': 'SCREEN_SCREENS',
  '/api/suppliers/verify': 'SCREEN_SUPPLIER_VERIFY',
  '/api/suppliers': 'SCREEN_SUPPLIERS',
  '/api/categories': 'SCREEN_CATEGORIES',
  '/api/tenders': 'SCREEN_TENDERS',
  '/api/bids': 'SCREEN_BIDS',
  '/api/quotations': 'SCREEN_QUOTATIONS',
  '/api/products': 'SCREEN_PRODUCTS',
  '/api/inventory/levels': 'SCREEN_STOCK_LEVELS',
  '/api/inventory/receipts': 'SCREEN_STOCK_RECEIPTS',
  '/api/inventory/alerts': 'SCREEN_STOCK_ALERTS',
  '/api/storefront': 'SCREEN_STOREFRONT',
  '/api/transactions': 'SCREEN_TRANSACTIONS',
};

/**
 * HTTP METHOD → PERMISSION TYPE MAP
 */
const METHOD_PERMISSION_MAP = {
  GET: 'canView',
  POST: 'canCreate',
  PUT: 'canEdit',
  PATCH: 'canEdit',
  DELETE: 'canDelete',
};

/**
 * authenticate
 * Verifies JWT and attaches user + permissions to req
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await SystemUser.findById(decoded.userId)
      .select('+password')
      .populate({
        path: 'role',
        select: 'name isSuperAdmin permissions',
      });

    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });
    if (user.isLocked) return res.status(403).json({ success: false, message: 'Account locked' });

    req.user = user;
    req.isSuperAdmin = user.isSuperAdmin;
    req.permissions = user.role?.permissions || [];

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 * authorizeScreen
 * Checks if the user's role has the required permission for the screen
 * that the requested route maps to.
 *
 * Usage in routes:
 *   router.get('/', authenticate, authorizeScreen, controller.getAll)
 *   — automatically detects the route and HTTP method
 */
const authorizeScreen = (req, res, next) => {
  // Super admin bypasses all permission checks
  if (req.isSuperAdmin) return next();

  // Find which screen this route maps to
  const screenCode = getScreenCodeForRoute(req.path, req.baseUrl);
  if (!screenCode) return next(); // unmapped routes are public (e.g. /api/health)

  // Determine what permission type is needed (view/create/edit/delete)
  const permissionType = METHOD_PERMISSION_MAP[req.method];
  if (!permissionType) return next();

  // Check if user's role has this permission
  const permission = req.permissions.find((p) => p.screenCode === screenCode);

  if (!permission || !permission[permissionType]) {
    return res.status(403).json({
      success: false,
      message: `Access denied. You don't have ${permissionType} permission for this module.`,
      screenCode,
      permissionType,
    });
  }

  next();
};

/**
 * requireSuperAdmin
 * Hard guard — only super admin can access the route
 * Used on: /api/system-users, /api/roles, /api/parent-menus, etc.
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.isSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: 'This action requires Super Admin access',
    });
  }
  next();
};

/**
 * Helper: resolve route path to a screen code
 */
const getScreenCodeForRoute = (path, baseUrl) => {
  const fullPath = baseUrl + path;

  // Try longest match first (more specific routes first)
  const sortedRoutes = Object.keys(ROUTE_SCREEN_MAP).sort((a, b) => b.length - a.length);

  for (const routePrefix of sortedRoutes) {
    if (fullPath.startsWith(routePrefix)) {
      return ROUTE_SCREEN_MAP[routePrefix];
    }
  }
  return null;
};

module.exports = { authenticate, authorizeScreen, requireSuperAdmin };

/**
 * checkPermission(screenCode, action)
 * Explicit permission check middleware — for routes with mixed screen codes
 * Usage: router.post('/', checkPermission('SCREEN_SUPPLIERS_ADD', 'canCreate'), handler)
 */
const checkPermission = (screenCode, action) => (req, res, next) => {
  if (req.isSuperAdmin) return next();
  const perm = req.permissions.find(p => p.screenCode === screenCode);
  if (!perm || !perm[action]) {
    return res.status(403).json({
      success: false,
      message: `Access denied. You need ${action} on ${screenCode}`,
      screenCode, action,
    });
  }
  next();
};

// Re-export with checkPermission
module.exports = { authenticate, authorizeScreen, requireSuperAdmin, checkPermission };