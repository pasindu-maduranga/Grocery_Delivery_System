const express = require('express');
const router  = express.Router();
const {
  receiveOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  deleteOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Public — receives orders pushed from the customer service
router.post('/', receiveOrder);

// Protected — admin only
router.get('/stats', protect, getOrderStats);
router.get('/',     protect, getAllOrders);
router.get('/:id',  protect, getOrderById);
router.patch('/:id/status', protect, updateOrderStatus);
router.delete('/:id', protect, deleteOrder);

module.exports = router;
