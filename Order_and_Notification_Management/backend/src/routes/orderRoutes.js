const express = require('express');
const router  = express.Router();
const {
  receiveOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  deleteOrder,
  getReadyOrders,
  getAvailableDrivers,

} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Public — receives orders pushed from the customer service
router.post('/', receiveOrder);

// Protected — customer orders
router.get('/my-orders', protect, getMyOrders);

// Protected — admin only
router.get('/stats', protect, getOrderStats);
router.get('/ready', protect, getReadyOrders);
router.get('/drivers/available', protect, getAvailableDrivers);
router.get('/',     protect, getAllOrders);
router.get('/:id',  protect, getOrderById);
router.patch('/:id/status', protect, updateOrderStatus);
router.delete('/:id', protect, deleteOrder);


module.exports = router;
