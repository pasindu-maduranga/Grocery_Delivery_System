const SystemUser = require('../Models/SystemUser');
const Role = require('../Models/Role');


const getAllUsers = async (req, res) => {
  try {
    const users = await SystemUser.find({ isSuperAdmin: false })
      .populate('role', 'name isActive')
      .populate('createdBy', 'firstName lastName')
      .select('-password');

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await SystemUser.findById(req.params.id)
      .populate('role', 'name permissions isActive')
      .select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { firstName, lastName, username, password, roleId } = req.body;

    const existing = await SystemUser.findOne({ username: username?.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Username already taken' });

    const role = await Role.findById(roleId);
    if (!role || !role.isActive) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive role' });
    }

    if (role.isSuperAdmin) {
      return res.status(400).json({ success: false, message: 'Cannot assign Super Admin role to a new user' });
    }

    const user = await SystemUser.create({
      firstName,
      lastName,
      username,
      password,
      role: roleId,
      createdBy: req.user._id,
    });

    const populated = await SystemUser.findById(user._id)
      .populate('role', 'name')
      .select('-password');

    res.status(201).json({ success: true, message: 'User created successfully', data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, roleId } = req.body;

    const user = await SystemUser.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isSuperAdmin) return res.status(400).json({ success: false, message: 'Cannot modify Super Admin' });

    if (roleId) {
      const role = await Role.findById(roleId);
      if (!role || !role.isActive || role.isSuperAdmin) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }
      user.role = roleId;
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;

    await user.save({ validateBeforeSave: false });

    const updated = await SystemUser.findById(user._id)
      .populate('role', 'name')
      .select('-password');

    res.status(200).json({ success: true, message: 'User updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const toggleActive = async (req, res) => {
  try {
    const user = await SystemUser.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isSuperAdmin) return res.status(400).json({ success: false, message: 'Cannot deactivate Super Admin' });

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      isActive: user.isActive,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const toggleLock = async (req, res) => {
  try {
    const user = await SystemUser.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isSuperAdmin) return res.status(400).json({ success: false, message: 'Cannot lock Super Admin' });

    user.isLocked = !user.isLocked;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `User ${user.isLocked ? 'locked' : 'unlocked'}`,
      isLocked: user.isLocked,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await SystemUser.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isSuperAdmin) return res.status(400).json({ success: false, message: 'Cannot reset Super Admin password via API' });

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleActive,
  toggleLock,
  resetPassword,
};
