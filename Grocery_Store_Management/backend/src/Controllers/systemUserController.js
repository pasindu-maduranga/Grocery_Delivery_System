const SystemUser = require('../Models/SystemUser');
const Role = require('../Models/Role');
const axios = require('axios');
const { sendDriverCredentialsEmail } = require('../Config/mailer');

const syncDriverToDeliveryService = async (user, roleName) => {
  const isDriver = roleName?.toLowerCase() === 'driver' || roleName?.toLowerCase() === 'delivery person';
  if (!isDriver) return;

  const DELIVERY_API = process.env.DELIVERY_SERVICE_URL || 'http://delivery-service:5005/api';
  console.log(`[DriverSync] Calling: ${DELIVERY_API}/drivers/register`);
  try {
    await axios.post(`${DELIVERY_API}/drivers/register`, {
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email || `${user.username}@freshcart.com`,
      phone: '', // Can be updated later by driver
      vehicleType: 'Motorcycle', 
    });
    console.log(`Synced driver ${user.username} to Delivery Service`);
  } catch (err) {
    if (err.response) {
      console.error(`Sync to Delivery Service failed for ${user.username}: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
    } else {
      console.error(`Sync to Delivery Service failed for ${user.username}:`, err.message);
    }
  }
};

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
    let { firstName, lastName, email, username, password, roleId } = req.body;

    // Auto-generate password if not provided (typical for admin-driven onboarding)
    const wasGenerated = !password;
    if (!password) {
      password = Math.random().toString(36).slice(-10) + 'A1!'; // Secure-ish random pass
    }

    const existing = await SystemUser.findOne({ 
      $or: [{ username: username?.toLowerCase() }, { email: email?.toLowerCase() }] 
    });
    if (existing) return res.status(400).json({ success: false, message: 'Username or Email already taken' });

    const role = await Role.findById(roleId);
    if (!role || !role.isActive) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive role' });
    }

    const user = await SystemUser.create({
      firstName, lastName, email, username, password,
      role: roleId,
      createdBy: req.user._id,
    });

    // Handle Driver Specific logic
    const isDriver = role.name?.toLowerCase() === 'driver' || role.name?.toLowerCase() === 'delivery person';
    if (isDriver && email) {
      try {
        await sendDriverCredentialsEmail({
          to: email,
          driverName: `${firstName} ${lastName}`,
          username,
          password,
          roleName: role.name
        });
      } catch (mailErr) { console.error('Driver email failed:', mailErr.message); }
    }

    await syncDriverToDeliveryService(user, role.name);

    const populated = await SystemUser.findById(user._id).populate('role', 'name').select('-password');
    res.status(201).json({ success: true, message: 'User created successfully', data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, roleId } = req.body;

    const user = await SystemUser.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    let previousRoleName = '';
    if (user.role) {
      const pRole = await Role.findById(user.role);
      previousRoleName = pRole?.name;
    }

    if (roleId) {
      const role = await Role.findById(roleId);
      if (!role || !role.isActive || role.isSuperAdmin) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }
      user.role = roleId;
      
      // If role changed to Driver, sync it
      if (role.name !== previousRoleName) {
        await syncDriverToDeliveryService(user, role.name);
      }
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    await user.save({ validateBeforeSave: false });

    const updated = await SystemUser.findById(user._id).populate('role', 'name').select('-password');
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

const syncAllDrivers = async (req, res) => {
  try {
    const roles = await Role.find({ 
      name: { $regex: /driver|delivery person/i } 
    });
    const roleIds = roles.map(r => r._id);
    
    const users = await SystemUser.find({ role: { $in: roleIds } }).populate('role', 'name');
    
    console.log(`[BulkSync] Found ${users.length} drivers. Starting sync...`);
    
    for (const user of users) {
       await syncDriverToDeliveryService(user, user.role?.name);
    }

    res.status(200).json({ success: true, message: `Synced ${users.length} potential drivers` });
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
  syncAllDrivers,
};
