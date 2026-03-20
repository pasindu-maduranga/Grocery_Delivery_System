const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/adminOrderController');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');

// Get all orders (Admin/Superadmin only)
router.get('/all', authMiddleware, roleCheck(['superadmin', 'admin']), adminOrderController.getAllOrders);

// Update order status (Admin/Superadmin only)
router.patch('/status/:orderId', authMiddleware, roleCheck(['superadmin', 'admin']), adminOrderController.updateOrderStatus);

module.exports = router;
