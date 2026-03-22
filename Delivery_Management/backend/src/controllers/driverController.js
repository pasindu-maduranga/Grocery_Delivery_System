const driverService = require('../services/driverService');
const Driver = require('../models/Driver');

// Get driver by ID
exports.getDriverById = async (req, res) => {
  try {
    const { driverId } = req.params;
    const driver = await driverService.getDriverById(driverId);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.status(200).json({ success: true, driver });
  } catch (error) {
    console.error('Error getting driver:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending assignments for a driver
exports.getPendingAssignments = async (req, res) => {
  try {
    const { driverId } = req.params;
    const pendingAssignments = await driverService.getPendingAssignments(driverId);
    res.status(200).json(pendingAssignments);
  } catch (error) {
    console.error('Error getting pending assignments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current orders for a driver
exports.getCurrentOrders = async (req, res) => {
  try {
    const { driverId } = req.params;
    const currentOrders = await driverService.getCurrentOrders(driverId);
    res.status(200).json(currentOrders);
  } catch (error) {
    console.error('Error getting current orders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update driver availability
exports.updateAvailability = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { isAvailable } = req.body;
    if (isAvailable === undefined) {
      return res.status(400).json({ success: false, message: 'isAvailable status is required' });
    }
    const driver = await driverService.updateAvailability(driverId, isAvailable);
    res.status(200).json({ success: true, driver });
  } catch (error) {
    console.error('Error updating driver availability:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update driver location
exports.updateLocation = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { longitude, latitude } = req.body;
    if (longitude === undefined || latitude === undefined) {
      return res.status(400).json({ success: false, message: 'Longitude and latitude are required' });
    }
    const driver = await driverService.updateLocation(driverId, longitude, latitude);
    res.status(200).json({ success: true, driver });
  } catch (error) {
    console.error('Error updating driver location:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept an order
exports.acceptOrder = async (req, res) => {
  try {
    const { driverId, orderId } = req.params;
    const result = await driverService.acceptOrder(driverId, orderId);
    if (req.io) {
      req.io.to(`order_${orderId}`).emit('driver_assigned', {
        orderId, driverId, status: 'accepted', driverInfo: result.driver
      });
    }
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject an order
exports.rejectOrder = async (req, res) => {
  try {
    const { driverId, orderId } = req.params;
    const { rejectionReason } = req.body;
    const result = await driverService.rejectOrder(driverId, orderId, rejectionReason);
    if (req.io) {
      req.io.emit('order_rejected', {
        orderId, driverId,
        rejectionReason: rejectionReason || 'Driver unavailable'
      });
    }
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Error rejecting order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete delivery
exports.completeDelivery = async (req, res) => {
  try {
    const { driverId, orderId } = req.params;
    const result = await driverService.completeDelivery(driverId, orderId);
    if (req.io) {
      req.io.to(`order_${orderId}`).emit('delivery_completed', {
        orderId, driverId, completionTime: new Date()
      });
    }
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Error completing delivery:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Register a driver
exports.registerDriver = async (req, res) => {
  try {
    const { userId, name, email, phone, vehicleType, licensePlate, maxCarryWeightKg } = req.body;
    if (!userId || !email) {
      return res.status(400).json({
        success: false,
        message: 'User ID and email are required'
      });
    }

    // Check if driver already exists
    let driver = await Driver.findOne({ userId });
    if (driver) {
      driver.name              = name              || driver.name;
      driver.email             = email             || driver.email;
      driver.phone             = phone             || driver.phone;
      driver.vehicleType       = vehicleType       || driver.vehicleType;
      driver.licensePlate      = licensePlate      || driver.licensePlate;
      driver.maxCarryWeightKg  = maxCarryWeightKg  || driver.maxCarryWeightKg;
      await driver.save();
      return res.status(200).json({
        success: true,
        message: 'Driver record updated',
        driver
      });
    }

    // Create new driver
    driver = new Driver({
      userId, name, email, phone,
      vehicleType:      vehicleType      || 'Car',
      licensePlate:     licensePlate     || '',
      maxCarryWeightKg: maxCarryWeightKg || 20,
      isAvailable: false,
      isActive:    true
    });
    await driver.save();

    res.status(201).json({
      success: true,
      message: 'Driver registered successfully',
      driver
    });
  } catch (error) {
    console.error('Error registering driver:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};