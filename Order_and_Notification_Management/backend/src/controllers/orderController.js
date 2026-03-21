const orderService                    = require('../services/orderService');
const asyncHandler                    = require('../utils/asyncHandler');
const { sendSuccess, sendError }      = require('../utils/responseHandler');

// POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder({
    userId: req.user.id,
    body:   req.body,
  });
  sendSuccess(res, 201, 'Order created successfully', order);
});

// GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user.id);
  sendSuccess(res, 200, 'Orders fetched', orders);
});

// GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(
    req.params.id,
    req.user.id,
    req.user.role
  );
  sendSuccess(res, 200, 'Order fetched', order);
});

// GET /api/orders/restaurant/:restaurantId
const getRestaurantOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getRestaurantOrders(req.params.restaurantId);
  sendSuccess(res, 200, 'Restaurant orders fetched', orders);
});

// GET /api/orders/rider/:riderId
const getRiderOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getRiderOrders(req.params.riderId);
  sendSuccess(res, 200, 'Rider orders fetched', orders);
});

// PATCH /api/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, status, note);
  sendSuccess(res, 200, 'Order status updated', order);
});

// PATCH /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(
    req.params.id,
    req.user.id,
    req.user.role
  );
  sendSuccess(res, 200, 'Order cancelled', order);
});

// POST /api/orders/webhook/payment
const paymentWebhook = asyncHandler(async (req, res) => {
  const { orderId, paymentId, paymentStatus } = req.body;
  const order = await orderService.updatePayment({ orderId, paymentId, paymentStatus });
  sendSuccess(res, 200, 'Payment status updated', order);
});

// POST /api/orders/webhook/delivery
const deliveryWebhook = asyncHandler(async (req, res) => {
  const { orderId, riderId, riderStatus, riderSnapshot } = req.body;
  const order = await orderService.updateRiderStatus({
    orderId, riderId, riderStatus, riderSnapshot,
  });
  sendSuccess(res, 200, 'Delivery status updated', order);
});

// GET /api/orders/admin/all
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getAllOrders(req.query);
  sendSuccess(res, 200, 'All orders fetched', orders);
});

module.exports = {
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
};