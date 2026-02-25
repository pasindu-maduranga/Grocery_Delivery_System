const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');

// GET /api/delivery/status - placeholder route
router.get('/status', deliveryController.getStatus);

module.exports = router;
