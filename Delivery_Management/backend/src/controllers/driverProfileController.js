// controllers/driverProfileController.js
const Driver = require('../models/Driver');

// ── Get driver profile by MongoDB _id ───────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.driverId).select('-__v');
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.status(200).json({ success: true, driver });
  } catch (error) {
    console.error('[DriverProfile] getProfile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get driver profile by userId (from auth system) ─────────────────────────
exports.getProfileByUserId = async (req, res) => {
  try {
    const driver = await Driver.findByUserId(req.params.userId).select('-__v');
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.status(200).json({ success: true, driver });
  } catch (error) {
    console.error('[DriverProfile] getProfileByUserId error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update driver profile ────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, vehicleType, licensePlate, maxCarryWeightKg } = req.body;

    // Only allow these fields to be updated via profile edit
    const updateFields = {};
    if (name)              updateFields.name              = name;
    if (email)             updateFields.email             = email;
    if (phone)             updateFields.phone             = phone;
    if (vehicleType)       updateFields.vehicleType       = vehicleType;
    if (licensePlate)      updateFields.licensePlate      = licensePlate;
    if (maxCarryWeightKg)  updateFields.maxCarryWeightKg  = maxCarryWeightKg;

    const driver = await Driver.findByIdAndUpdate(
      req.params.driverId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.status(200).json({ success: true, message: 'Profile updated successfully', driver });
  } catch (error) {
    console.error('[DriverProfile] updateProfile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Toggle driver active status (soft delete / deactivate) ──────────────────
exports.toggleActiveStatus = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.driverId);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    driver.isActive = !driver.isActive;
    // If deactivating, also mark unavailable
    if (!driver.isActive) driver.isAvailable = false;
    await driver.save();

    res.status(200).json({
      success: true,
      message: `Driver ${driver.isActive ? 'activated' : 'deactivated'} successfully`,
      driver,
    });
  } catch (error) {
    console.error('[DriverProfile] toggleActiveStatus error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get driver stats (summary for profile page) ──────────────────────────────
exports.getDriverStats = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.driverId).select('-__v');
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const stats = {
      totalCompleted:    driver.completedOrders?.length  || 0,
      totalCurrent:      driver.currentOrders?.length    || 0,
      totalPending:      driver.pendingAssignments?.length || 0,
      averageRating:     driver.rating?.average           || 0,
      ratingCount:       driver.rating?.count             || 0,
      isAvailable:       driver.isAvailable,
      isActive:          driver.isActive,
      memberSince:       driver.createdAt,
    };

    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('[DriverProfile] getDriverStats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update driver location ────────────────────────────────────────────────────
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'latitude and longitude are required' });
    }

    const driver = await Driver.findByIdAndUpdate(
      req.params.driverId,
      {
        $set: {
          'currentLocation.latitude':    latitude,
          'currentLocation.longitude':   longitude,
          'currentLocation.lastUpdated': new Date(),
        },
      },
      { new: true }
    ).select('-__v');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.status(200).json({ success: true, message: 'Location updated', driver });
  } catch (error) {
    console.error('[DriverProfile] updateLocation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};