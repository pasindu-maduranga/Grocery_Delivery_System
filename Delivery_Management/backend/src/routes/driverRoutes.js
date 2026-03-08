// const express = require('express');
// const router = express.Router();
// const driverController = require('../controllers/driverController');

// // Get driver by ID
// router.get('/:driverId', driverController.getDriverById);

// // Get pending assignments for a driver
// router.get('/:driverId/pending-assignments', driverController.getPendingAssignments);

// // Get current orders for a driver
// router.get('/:driverId/current-orders', driverController.getCurrentOrders);

// // Update driver availability
// router.put('/:driverId/availability', driverController.updateAvailability);

// // Update driver location
// router.put('/:driverId/location', driverController.updateLocation);

// // Accept an order
// router.post('/:driverId/accept/:orderId', driverController.acceptOrder);

// // Reject an order
// router.post('/:driverId/reject/:orderId', driverController.rejectOrder);

// // Complete delivery
// router.post('/:driverId/complete/:orderId', driverController.completeDelivery);

// // Register a new driver
// router.post('/register', driverController.registerDriver);

// module.exports = router;

const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

// Register a new driver — MUST be before /:driverId to avoid conflict
router.post('/register', driverController.registerDriver);

// Get driver by ID
router.get('/:driverId', driverController.getDriverById);

// Get pending assignments for a driver
router.get('/:driverId/pending-assignments', driverController.getPendingAssignments);

// Get current orders for a driver
router.get('/:driverId/current-orders', driverController.getCurrentOrders);

// Update driver availability
router.put('/:driverId/availability', driverController.updateAvailability);

// Update driver location
router.put('/:driverId/location', driverController.updateLocation);

// Accept an order
router.post('/:driverId/accept/:orderId', driverController.acceptOrder);

// Reject an order
router.post('/:driverId/reject/:orderId', driverController.rejectOrder);

// Complete delivery
router.post('/:driverId/complete/:orderId', driverController.completeDelivery);

module.exports = router;