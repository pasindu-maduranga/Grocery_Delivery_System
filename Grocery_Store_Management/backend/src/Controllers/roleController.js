const Role = require('../Models/Role');
const Screen = require('../Models/Screen');


const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({ isSuperAdmin: false })
      .select('name description isActive createdAt')
      .populate('createdBy', 'firstName lastName');

    res.status(200).json({ success: true, count: roles.length, data: roles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).populate('createdBy', 'firstName lastName');
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

    res.status(200).json({ success: true, data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existing = await Role.findOne({ name });
    if (existing) return res.status(400).json({ success: false, message: 'Role name already exists' });

    const role = await Role.create({
      name,
      description,
      permissions: [],
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Role created', data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    if (role.isSuperAdmin) return res.status(400).json({ success: false, message: 'Cannot modify Super Admin role' });

    role.name = name || role.name;
    role.description = description || role.description;
    if (typeof isActive === 'boolean') role.isActive = isActive;

    await role.save();
    res.status(200).json({ success: true, message: 'Role updated', data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    if (role.isSuperAdmin) return res.status(400).json({ success: false, message: 'Cannot delete Super Admin role' });

    const SystemUser = require('../Models/SystemUser');
    const usersWithRole = await SystemUser.countDocuments({ role: role._id, isActive: true });
    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot deactivate role — ${usersWithRole} active user(s) are assigned to it`,
      });
    }

    role.isActive = false;
    await role.save();

    res.status(200).json({ success: true, message: 'Role deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const getRolePermissions = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

    const ParentMenu = require('../Models/ParentMenu');
    const Menu = require('../Models/Menu');

    const permissionLookup = {};
    role.permissions.forEach((p) => {
      permissionLookup[p.screenCode] = {
        canView: p.canView,
        canCreate: p.canCreate,
        canEdit: p.canEdit,
        canDelete: p.canDelete,
      };
    });

    const parentMenus = await ParentMenu.find({ isActive: true, isSuperAdminOnly: false }).sort('order');
    const result = [];

    for (const pm of parentMenus) {
      const menus = await Menu.find({ parentMenu: pm._id, isActive: true }).sort('order');
      const menuList = [];

      for (const m of menus) {
        const screens = await Screen.find({ menu: m._id, isActive: true }).sort('order');

        const screenList = screens.map((s) => {
          const existing = permissionLookup[s.code] || {};
          return {
            screenId: s._id,
            screenName: s.name,
            screenCode: s.code,
            route: s.route,
            description: s.description,
            canView: existing.canView || false,
            canCreate: existing.canCreate || false,
            canEdit: existing.canEdit || false,
            canDelete: existing.canDelete || false,
          };
        });

        menuList.push({
          menuId: m._id,
          menuName: m.name,
          menuCode: m.code,
          screens: screenList,
        });
      }

      result.push({
        parentMenuId: pm._id,
        parentMenuName: pm.name,
        parentMenuCode: pm.code,
        menus: menuList,
      });
    }

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateRolePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;

    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    if (role.isSuperAdmin) return res.status(400).json({ success: false, message: 'Cannot modify Super Admin permissions' });

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ success: false, message: 'permissions must be an array' });
    }

    const screenCodes = permissions.map((p) => p.screenCode);
    const validScreens = await Screen.find({ code: { $in: screenCodes } }).select('code');
    const validCodes = new Set(validScreens.map((s) => s.code));

    const invalidCodes = screenCodes.filter((c) => !validCodes.has(c));
    if (invalidCodes.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid screen codes: ${invalidCodes.join(', ')}`,
      });
    }

    role.permissions = permissions.filter(
      (p) => p.canView || p.canCreate || p.canEdit || p.canDelete
    );

    await role.save();

    res.status(200).json({
      success: true,
      message: 'Permissions updated successfully',
      permissionsCount: role.permissions.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  updateRolePermissions,
};
