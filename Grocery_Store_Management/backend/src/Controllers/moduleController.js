const ParentMenu = require('../Models/ParentMenu');
const Menu = require('../Models/Menu');
const Screen = require('../Models/Screen');

// ─── PARENT MENUS ─────────────────────────────────────────────────

const getAllParentMenus = async (req, res) => {
  try {
    const data = await ParentMenu.find().sort('order');
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createParentMenu = async (req, res) => {
  try {
    const { name, code, icon, order, isSuperAdminOnly } = req.body;

    const exists = await ParentMenu.findOne({ code: code?.toUpperCase() });
    if (exists) return res.status(400).json({ success: false, message: 'Parent menu code already exists' });

    const data = await ParentMenu.create({ name, code, icon, order, isSuperAdminOnly });
    res.status(201).json({ success: true, message: 'Parent menu created', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateParentMenu = async (req, res) => {
  try {
    const data = await ParentMenu.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, message: 'Updated', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const toggleParentMenuActive = async (req, res) => {
  try {
    const pm = await ParentMenu.findById(req.params.id);
    if (!pm) return res.status(404).json({ success: false, message: 'Not found' });
    pm.isActive = !pm.isActive;
    await pm.save();
    res.status(200).json({ success: true, message: `Parent menu ${pm.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── MENUS ────────────────────────────────────────────────────────

const getAllMenus = async (req, res) => {
  try {
    const { parentMenuId } = req.query;
    const filter = parentMenuId ? { parentMenu: parentMenuId } : {};
    const data = await Menu.find(filter).populate('parentMenu', 'name code').sort('order');
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createMenu = async (req, res) => {
  try {
    const { name, code, parentMenuId, icon, order } = req.body;

    const exists = await Menu.findOne({ code: code?.toUpperCase() });
    if (exists) return res.status(400).json({ success: false, message: 'Menu code already exists' });

    const pm = await ParentMenu.findById(parentMenuId);
    if (!pm) return res.status(400).json({ success: false, message: 'Parent menu not found' });

    const data = await Menu.create({ name, code, parentMenu: parentMenuId, icon, order });
    res.status(201).json({ success: true, message: 'Menu created', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateMenu = async (req, res) => {
  try {
    const data = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, message: 'Updated', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const toggleMenuActive = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ success: false, message: 'Not found' });
    menu.isActive = !menu.isActive;
    await menu.save();
    res.status(200).json({ success: true, message: `Menu ${menu.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SCREENS ──────────────────────────────────────────────────────

const getAllScreens = async (req, res) => {
  try {
    const { menuId } = req.query;
    const filter = menuId ? { menu: menuId } : {};
    const data = await Screen.find(filter)
      .populate({ path: 'menu', select: 'name code', populate: { path: 'parentMenu', select: 'name code' } })
      .sort('order');
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createScreen = async (req, res) => {
  try {
    const { name, code, menuId, route, description, order } = req.body;

    const exists = await Screen.findOne({ code: code?.toUpperCase() });
    if (exists) return res.status(400).json({ success: false, message: 'Screen code already exists' });

    const menu = await Menu.findById(menuId);
    if (!menu) return res.status(400).json({ success: false, message: 'Menu not found' });

    const data = await Screen.create({ name, code, menu: menuId, route, description, order });
    res.status(201).json({ success: true, message: 'Screen created', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateScreen = async (req, res) => {
  try {
    const data = await Screen.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, message: 'Updated', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const toggleScreenActive = async (req, res) => {
  try {
    const screen = await Screen.findById(req.params.id);
    if (!screen) return res.status(404).json({ success: false, message: 'Not found' });
    screen.isActive = !screen.isActive;
    await screen.save();
    res.status(200).json({ success: true, message: `Screen ${screen.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/module-structure
 * Returns full 3-level tree: ParentMenu → Menu → Screen
 * Used by the permission panel and sidebar builder
 */
const getFullModuleStructure = async (req, res) => {
  try {
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
            description: s.description,
          })),
        });
      }

      result.push({
        id: pm._id,
        name: pm.name,
        code: pm.code,
        icon: pm.icon,
        isSuperAdminOnly: pm.isSuperAdminOnly,
        menus: menuList,
      });
    }

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllParentMenus, createParentMenu, updateParentMenu, toggleParentMenuActive,
  getAllMenus, createMenu, updateMenu, toggleMenuActive,
  getAllScreens, createScreen, updateScreen, toggleScreenActive,
  getFullModuleStructure,
};
