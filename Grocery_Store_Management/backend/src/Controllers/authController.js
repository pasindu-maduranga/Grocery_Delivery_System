const jwt        = require('jsonwebtoken');
const SystemUser = require('../Models/SystemUser');
const Supplier   = require('../Models/Supplier');
const ParentMenu = require('../Models/ParentMenu');
const Menu       = require('../Models/Menu');
const Screen     = require('../Models/Screen');

const generateToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '8h',
});

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Username and password are required' });

    const user = await SystemUser.findOne({ username: username.toLowerCase() })
      .select('+password')
      .populate({ path: 'role', select: 'name isSuperAdmin permissions' });

    if (!user)          return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated. Contact Super Admin.' });
    if (user.isLocked)  return res.status(403).json({ success: false, message: 'Account locked. Contact Super Admin.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken({
      userId:       user._id,
      username:     user.username,
      userType:     'system_user',
      isSuperAdmin: user.isSuperAdmin,
      roleId:       user.role?._id,
      roleName:     user.role?.name,
      permissions:  user.role?.permissions || [],
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      userType: 'system_user',
      user: {
        id:           user._id,
        firstName:    user.firstName,
        lastName:     user.lastName,
        username:     user.username,
        isSuperAdmin: user.isSuperAdmin,
        role:         { id: user.role?._id, name: user.role?.name },
        permissions:  user.role?.permissions || [],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const supplierLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Username and password are required' });

    const supplier = await Supplier.findOne({ username: username.toLowerCase() })
      .select('+password')
      .populate({ path: 'role', select: 'name permissions' });

    if (!supplier)                      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (supplier.status !== 'approved') return res.status(403).json({ success: false, message: 'Account not approved yet. Contact Admin.' });
    if (!supplier.isActive)             return res.status(403).json({ success: false, message: 'Account deactivated. Contact Admin.' });
    if (supplier.isLocked)              return res.status(403).json({ success: false, message: 'Account locked. Contact Admin.' });

    const isMatch = await supplier.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    supplier.lastLoginAt = new Date();
    await supplier.save({ validateBeforeSave: false });

    const token = generateToken({
      userId:       supplier._id,
      username:     supplier.username,
      userType:     'supplier',
      isSuperAdmin: false,
      roleId:       supplier.role?._id,
      roleName:     supplier.role?.name,
      permissions:  supplier.role?.permissions || [],
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      userType: 'supplier',
      user: {
        id:                supplier._id,
        businessName:      supplier.businessName,
        contactPersonName: supplier.contactPersonName,
        username:          supplier.username,
        email:             supplier.email,
        role:              { id: supplier.role?._id, name: supplier.role?.name },
        permissions:       supplier.role?.permissions || [],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await SystemUser.findById(req.user._id)
      .populate({ path: 'role', select: 'name isSuperAdmin permissions' });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let sidebar = [];
    if (user.isSuperAdmin) {
      sidebar = await buildFullSidebar();
    } else {
      const viewableScreenCodes = (user.role?.permissions || [])
        .filter(p => p.canView).map(p => p.screenCode);
      sidebar = await buildFilteredSidebar(viewableScreenCodes);
    }

    res.json({
      success: true,
      userType: 'system_user',
      user: {
        id:           user._id,
        firstName:    user.firstName,
        lastName:     user.lastName,
        username:     user.username,
        isSuperAdmin: user.isSuperAdmin,
        lastLoginAt:  user.lastLoginAt,
        role:         { id: user.role?._id, name: user.role?.name },
        permissions:  user.role?.permissions || [],
      },
      sidebar,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getSupplierMe = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.user._id)
      .populate({ path: 'role', select: 'name permissions' })
      .select('-password');

    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

    const permissions = supplier.role?.permissions || [];
    const viewableScreenCodes = permissions.filter(p => p.canView).map(p => p.screenCode);
    const sidebar = await buildFilteredSidebar(viewableScreenCodes);

    res.json({
      success: true,
      userType: 'supplier',
      user: {
        id:                supplier._id,
        businessName:      supplier.businessName,
        contactPersonName: supplier.contactPersonName,
        username:          supplier.username,
        email:             supplier.email,
        phone:             supplier.phone,
        status:            supplier.status,
        isActive:          supplier.isActive,
        isLocked:          supplier.isLocked,
        lastLoginAt:       supplier.lastLoginAt,
        role:              { id: supplier.role?._id, name: supplier.role?.name },
        permissions,
      },
      sidebar,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

const updateSupplierProfile = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.user._id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

    const editableFields = [
      'contactPersonName', 'phone', 'whatsapp', 'website',
      'streetAddress', 'city', 'stateProvince', 'postalCode', 'country',
      'bankName', 'accountHolderName', 'accountNumber', 'swiftCode', 'paymentMethod',
    ];
    editableFields.forEach(f => { if (req.body[f] !== undefined) supplier[f] = req.body[f]; });

    await supplier.save({ validateBeforeSave: false });
    const updated = await Supplier.findById(supplier._id).populate('role', 'name').select('-password');
    res.json({ success: true, message: 'Profile updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const buildFullSidebar = async () => {
  const parentMenus = await ParentMenu.find({ isActive: true }).sort('order');
  const result = [];
  for (const pm of parentMenus) {
    const menus = await Menu.find({ parentMenu: pm._id, isActive: true }).sort('order');
    const menuList = [];
    for (const m of menus) {
      const screens = await Screen.find({ menu: m._id, isActive: true }).sort('order');
      menuList.push({
        id: m._id, name: m.name, code: m.code, icon: m.icon,
        screens: screens.map(s => ({ id: s._id, name: s.name, code: s.code, route: s.route, icon: s.icon })),
      });
    }
    result.push({ id: pm._id, name: pm.name, code: pm.code, icon: pm.icon, menus: menuList });
  }
  return result;
};

const buildFilteredSidebar = async (viewableScreenCodes) => {
  const parentMenus = await ParentMenu.find({ isActive: true, isSuperAdminOnly: false }).sort('order');
  const result = [];
  for (const pm of parentMenus) {
    const menus = await Menu.find({ parentMenu: pm._id, isActive: true }).sort('order');
    const menuList = [];
    for (const m of menus) {
      const screens = await Screen.find({ menu: m._id, isActive: true, code: { $in: viewableScreenCodes } }).sort('order');
      if (screens.length > 0) {
        menuList.push({
          id: m._id, name: m.name, code: m.code, icon: m.icon,
          screens: screens.map(s => ({ id: s._id, name: s.name, code: s.code, route: s.route })),
        });
      }
    }
    if (menuList.length > 0)
      result.push({ id: pm._id, name: pm.name, code: pm.code, icon: pm.icon, menus: menuList });
  }
  return result;
};

module.exports = { login, supplierLogin, getMe, getSupplierMe, logout, updateSupplierProfile };
