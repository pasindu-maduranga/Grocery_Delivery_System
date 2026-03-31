const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

// ─── Non-parameterized Routes First ──────────────────────────────────────────

// Register
router.post('/register', driverController.registerDriver);

// Get available drivers (for admin list)
router.get('/available', driverController.getAvailableDrivers);

// Find driver by User ID
router.get('/find/:userId', driverController.getDriverByUserId);

// Get all drivers (admin list)
router.get('/', driverController.getAllDrivers);

// Manual assignment
router.post('/assign-order', driverController.assignOrderToDriver);

// ─── Parameterized Driver Routes ──────────────────────────────────────────────

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

// Toggle active status
router.patch('/:driverId/toggle-active', driverController.toggleActiveStatus);

module.exports = router;