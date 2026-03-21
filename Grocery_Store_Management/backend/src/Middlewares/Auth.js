const jwt        = require('jsonwebtoken');
const SystemUser = require('../Models/SystemUser');
const Supplier   = require('../Models/Supplier');
const Role       = require('../Models/Role');

const ROUTE_SCREEN_MAP = {
  '/api/system-users':       'SCREEN_USERS',
  '/api/roles':              'SCREEN_ROLES',
  '/api/parent-menus':       'SCREEN_PARENT_MENUS',
  '/api/menus':              'SCREEN_MENUS',
  '/api/screens':            'SCREEN_SCREENS',
  '/api/suppliers/verify':        'SCREEN_SUPPLIER_VERIFY',
  '/api/suppliers':               'SCREEN_SUPPLIERS',
  '/api/grocery-items':           'SCREEN_GROCERY_ITEMS',
  '/api/grocery-submissions':     'SCREEN_GROCERY_SUBMISSIONS',
  '/api/inventory':               'SCREEN_INVENTORY',
  '/api/categories':         'SCREEN_CATEGORIES',
  '/api/tenders':            'SCREEN_TENDERS',
  '/api/bids':               'SCREEN_BIDS',
  '/api/quotations':         'SCREEN_QUOTATIONS',
  '/api/products':           'SCREEN_PRODUCTS',
  '/api/inventory/levels':   'SCREEN_STOCK_LEVELS',
  '/api/inventory/receipts': 'SCREEN_STOCK_RECEIPTS',
  '/api/inventory/alerts':   'SCREEN_STOCK_ALERTS',
  '/api/storefront':         'SCREEN_STOREFRONT',
  '/api/transactions':       'SCREEN_TRANSACTIONS',
};

const METHOD_PERMISSION_MAP = {
  GET:    'canView',
  POST:   'canCreate',
  PUT:    'canEdit',
  PATCH:  'canEdit',
  DELETE: 'canDelete',
};

const getScreenCodeForRoute = (path, baseUrl) => {
  const fullPath = baseUrl + path;
  const sorted   = Object.keys(ROUTE_SCREEN_MAP).sort((a, b) => b.length - a.length);
  for (const prefix of sorted) {
    if (fullPath.startsWith(prefix)) return ROUTE_SCREEN_MAP[prefix];
  }
  return null;
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'No token provided' });

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userType = decoded.userType;

    if (userType === 'supplier') {
      const supplier = await Supplier.findById(decoded.userId)
        .populate({ path: 'role', select: 'name permissions' });

      if (!supplier)                      return res.status(401).json({ success: false, message: 'Supplier not found' });
      if (supplier.status !== 'approved') return res.status(403).json({ success: false, message: 'Account not approved' });
      if (!supplier.isActive)             return res.status(403).json({ success: false, message: 'Account deactivated' });
      if (supplier.isLocked)              return res.status(403).json({ success: false, message: 'Account locked' });

      req.user         = supplier;
      req.userType     = 'supplier';
      req.isSuperAdmin = false;
      req.permissions  = supplier.role?.permissions || [];
    } else {
      const user = await SystemUser.findById(decoded.userId)
        .select('+password')
        .populate({ path: 'role', select: 'name isSuperAdmin permissions' });

      if (!user)          return res.status(401).json({ success: false, message: 'User not found' });
      if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });
      if (user.isLocked)  return res.status(403).json({ success: false, message: 'Account locked' });

      req.user         = user;
      req.userType     = 'system_user';
      req.isSuperAdmin = user.isSuperAdmin;
      req.permissions  = user.role?.permissions || [];
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const authorizeScreen = (req, res, next) => {
  if (req.isSuperAdmin) return next();

  const screenCode = getScreenCodeForRoute(req.path, req.baseUrl);
  if (!screenCode) return next();

  const permissionType = METHOD_PERMISSION_MAP[req.method];
  if (!permissionType) return next();

  const permission = req.permissions.find(p => p.screenCode === screenCode);
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

const requireSuperAdmin = (req, res, next) => {
  if (!req.isSuperAdmin)
    return res.status(403).json({ success: false, message: 'This action requires Super Admin access' });
  next();
};

const checkPermission = (screenCode, action) => (req, res, next) => {
  if (req.isSuperAdmin) return next();
  const perm = req.permissions.find(p => p.screenCode === screenCode);
  if (!perm || !perm[action]) {
    return res.status(403).json({
      success: false,
      message: `Access denied. You need ${action} permission on ${screenCode}`,
      screenCode,
      action,
    });
  }
  next();
};

module.exports = { authenticate, authorizeScreen, requireSuperAdmin, checkPermission };
