const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

// Create a new delivery
router.post('/', deliveryController.createDelivery);

// Assign a driver to a delivery
router.post('/:deliveryId/assign-driver', deliveryController.assignDriver);

// Update delivery status
router.put('/:deliveryId/status', deliveryController.updateStatus);

// Update driver location for a delivery
router.put('/:deliveryId/driver-location', deliveryController.updateDriverLocation);

// Get delivery by ID
router.get('/:deliveryId', deliveryController.getDeliveryById);

// Rate a delivery
router.post('/:deliveryId/rate', deliveryController.rateDelivery);

module.exports = router;
