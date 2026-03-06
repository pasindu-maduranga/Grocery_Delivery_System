const jwt = require('jsonwebtoken');
const SystemUser = require('../models/SystemUser');

/**
 * Generate JWT containing userId + permissions snapshot
 */
const generateToken = (user) => {
  const payload = {
    userId: user._id,
    username: user.username,
    isSuperAdmin: user.isSuperAdmin,
    roleId: user.role?._id,
    roleName: user.role?.name,
    // Embed permissions in JWT so frontend can read without extra API call
    permissions: user.role?.permissions || [],
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // Find user and include password field (select: false by default)
    const user = await SystemUser.findOne({ username: username.toLowerCase() })
      .select('+password')
      .populate({ path: 'role', select: 'name isSuperAdmin permissions' });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact Super Admin.' });
    }

    if (user.isLocked) {
      return res.status(403).json({ success: false, message: 'Your account is locked. Contact Super Admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login time
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isSuperAdmin: user.isSuperAdmin,
        role: {
          id: user.role?._id,
          name: user.role?.name,
        },
        permissions: user.role?.permissions || [],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/auth/me
 * Returns current logged-in user's profile + fresh permissions
 */
const getMe = async (req, res) => {
  try {
    const user = await SystemUser.findById(req.user._id).populate({
      path: 'role',
      select: 'name isSuperAdmin permissions',
    });

    // Build full sidebar structure for this user
    const ParentMenu = require('../models/ParentMenu');
    const Menu = require('../models/Menu');
    const Screen = require('../models/Screen');

    let sidebar = [];

    if (user.isSuperAdmin) {
      // Super admin gets everything
      sidebar = await buildFullSidebar();
    } else {
      // Regular user gets only screens they have canView: true
      const viewableScreenCodes = (user.role?.permissions || [])
        .filter((p) => p.canView)
        .map((p) => p.screenCode);

      sidebar = await buildFilteredSidebar(viewableScreenCodes);
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isSuperAdmin: user.isSuperAdmin,
        lastLoginAt: user.lastLoginAt,
        role: {
          id: user.role?._id,
          name: user.role?.name,
        },
        permissions: user.role?.permissions || [],
      },
      sidebar,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/auth/logout
 * (Client just deletes the token — stateless JWT)
 */
const logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

/**
 * Helper: Build full sidebar (for super admin)
 * Returns: [ { parentMenu, menus: [ { menu, screens: [...] } ] } ]
 */
const buildFullSidebar = async () => {
  const ParentMenu = require('../models/ParentMenu');
  const Menu = require('../models/Menu');
  const Screen = require('../models/Screen');

  const parentMenus = await ParentMenu.find({ isActive: true }).sort('order');
  const result = [];

  for (const pm of parentMenus) {
    const menus = await Menu.find({ parentMenu: pm._id, isActive: true }).sort('order');
    const menuList = [];

    for (const m of menus) {
      const screens = await Screen.find({ menu: m._id, isActive: true }).sort('order');
      menuList.push({
        id: m._id,
        name: m.name,
        code: m.code,
        icon: m.icon,
        screens: screens.map((s) => ({
          id: s._id,
          name: s.name,
          code: s.code,
          route: s.route,
          icon: s.icon,
        })),
      });
    }

    result.push({
      id: pm._id,
      name: pm.name,
      code: pm.code,
      icon: pm.icon,
      menus: menuList,
    });
  }

  return result;
};

/**
 * Helper: Build filtered sidebar (for regular users)
 * Only includes screens the user has canView permission for
 */
const buildFilteredSidebar = async (viewableScreenCodes) => {
  const ParentMenu = require('../models/ParentMenu');
  const Menu = require('../models/Menu');
  const Screen = require('../models/Screen');

  const parentMenus = await ParentMenu.find({ isActive: true, isSuperAdminOnly: false }).sort('order');
  const result = [];

  for (const pm of parentMenus) {
    const menus = await Menu.find({ parentMenu: pm._id, isActive: true }).sort('order');
    const menuList = [];

    for (const m of menus) {
      const screens = await Screen.find({
        menu: m._id,
        isActive: true,
        code: { $in: viewableScreenCodes },
      }).sort('order');

      // Only include menu if it has at least one visible screen
      if (screens.length > 0) {
        menuList.push({
          id: m._id,
          name: m.name,
          code: m.code,
          icon: m.icon,
          screens: screens.map((s) => ({
            id: s._id,
            name: s.name,
            code: s.code,
            route: s.route,
          })),
        });
      }
    }

    // Only include parent menu if it has at least one visible menu
    if (menuList.length > 0) {
      result.push({
        id: pm._id,
        name: pm.name,
        code: pm.code,
        icon: pm.icon,
        menus: menuList,
      });
    }
  }

  return result;
};

module.exports = { login, getMe, logout };