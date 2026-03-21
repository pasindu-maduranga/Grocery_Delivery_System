const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getRestaurantOrders,
  getRiderOrders,
  updateOrderStatus,
  cancelOrder,
  paymentWebhook,
  deliveryWebhook,
  getAllOrders,
} = require('../controllers/orderController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const {
  validateCreateOrder,
  validateStatusUpdate,
  validatePaymentWebhook,
  validateDeliveryWebhook,
} = require('../middleware/validateMiddleware');

const router = express.Router();

// ── WEBHOOKS (no auth — called internally by other services)
router.post('/webhook/payment',  validatePaymentWebhook,  paymentWebhook);
router.post('/webhook/delivery', validateDeliveryWebhook, deliveryWebhook);

// ── CUSTOMER ROUTES
router.post('/',            protect, validateCreateOrder, createOrder);
router.get('/my',           protect, getMyOrders);
router.get('/:id',          protect, getOrderById);
router.patch('/:id/cancel', protect, cancelOrder);

// ── RESTAURANT ROUTES
router.get(
  '/restaurant/:restaurantId',
  protect,
  requireRole('restaurant', 'admin'),
  getRestaurantOrders
);

// ── RIDER ROUTES
router.get(
  '/rider/:riderId',
  protect,
  requireRole('rider', 'admin'),
  getRiderOrders
);

// ── STATUS UPDATE
router.patch(
  '/:id/status',
  protect,
  requireRole('restaurant', 'admin'),
  validateStatusUpdate,
  updateOrderStatus
);

// ── ADMIN
router.get(
  '/admin/all',
  protect,
  requireRole('admin'),
  getAllOrders
);

module.exports = router;