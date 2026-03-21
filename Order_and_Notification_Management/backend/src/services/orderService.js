const { Order, ORDER_STATUS, CANCELLABLE_STATUSES } = require('../models/Order');
const { getUserById }                               = require('../clients/userClient');
const { getRestaurantById }                         = require('../clients/groceryClient');
const { requestDelivery, cancelDelivery }           = require('../clients/deliveryClient');
const { initiatePayment }                           = require('../clients/paymentClient'); // ← NEW

// single store — set once here, never comes from frontend
const STORE_ID   = process.env.STORE_ID   || 'grocery-store-001'; 
const STORE_NAME = process.env.STORE_NAME || 'Fresh Grocery Store';

// ─────────────────────────────────────────────────────────────────────────────
//  CREATE ORDER
// ─────────────────────────────────────────────────────────────────────────────

const createOrder = async ({ userId, body }) => {
  const {
    // restaurantId,  ← REMOVED: single store, set automatically below
    items,
    address,
    addressLocation,
    phone,
    paymentMethod,
    deliveryType,
    instructions,
    shippingFee,
    discount,
  } = body;

  // 1. fetch user snapshot from User Service
  // const user = await getUserById(userId);

  // ── MOCK USER (remove when User Service is live)
  const user = {
    _id:   '64a1b2c3d4e5f6a7b8c9d0e1',
    name:  'Lashan Fernando',
    email: 'lashan@gmail.com',
    phone: '+94771234567',
  };

  // 2. fetch restaurant snapshot from Grocery Service
  // const restaurant = await getRestaurantById(STORE_ID); // ← use STORE_ID when live

  // ── MOCK RESTAURANT (remove when Grocery Service is live)
  const restaurant = {
    _id:           STORE_ID, // ← use constant instead of hardcoded string
    name:          STORE_NAME,
    logo:          'https://example.com/logo.png',
    address:       '45 Main Street, Colombo',
    contactNumber: '+94112345678',
  };

  // 3. map incoming item fields → schema field names
  //    frontend sends: { productId, name, price, quantity }
  //    schema expects: { productId, productName, unitPrice, quantity }
  const mappedItems = items.map((item) => ({
    productId:   item.productId,
    productName: item.name,
    unitPrice:   item.price,
    quantity:    item.quantity,
  }));

  // 4. build order — pricing auto-calculated in pre-save hook
  const order = new Order({
    userId,
    userEmail: user.email,          // required by schema
    userSnapshot: {
      name:  user.name,
      email: user.email,
      phone: user.phone,
    },
    restaurantId: STORE_ID, // ← set automatically from constant, not from body
    restaurantSnapshot: {
      name:          restaurant.name,
      logo:          restaurant.logo,
      address:       restaurant.address,
      contactNumber: restaurant.contactNumber,
    },
    items:         mappedItems,
    address,
    addressLocation,
    phone:         phone        || user.phone,
    paymentMethod: paymentMethod || 'cod',
    deliveryType:  deliveryType  || 'standard',
    instructions:  instructions  || '',
    shippingFee:   shippingFee   || 0,
    discount:      discount      || 0,
  });

  // 5. add initial timeline entry
  order.addTimeline(ORDER_STATUS.PENDING, 'Order placed');

  await order.save();

  // 6. initiate payment after order is saved ← NEW
  try {
    await initiatePayment({
      orderId:       order._id,
      total:         order.pricing.total,
      paymentMethod: order.paymentMethod,
    });
    order.addTimeline(ORDER_STATUS.PAYMENT_PENDING, 'Payment initiated');
    await order.save();
  } catch {
    console.warn('⚠️  Payment initiation failed for order:', order._id);
  }

  return order;
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET ALL ORDERS FOR A USER
// ─────────────────────────────────────────────────────────────────────────────

const getUserOrders = async (userId) => {
  return await Order.find({ userId }).sort({ createdAt: -1 });
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET SINGLE ORDER BY ID
// ─────────────────────────────────────────────────────────────────────────────

const getOrderById = async (orderId, userId, role) => {
  const order = await Order.findById(orderId);

  if (!order) throw new Error('Order not found');

  // only owner or admin can view
  if (role !== 'admin' && order.userId !== userId) {
    throw new Error('Not authorized to view this order');
  }

  return order;
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET ALL ORDERS FOR A RESTAURANT
// ─────────────────────────────────────────────────────────────────────────────

const getRestaurantOrders = async (restaurantId) => {
  return await Order.find({ restaurantId }).sort({ createdAt: -1 });
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET ALL ORDERS FOR A RIDER
// ─────────────────────────────────────────────────────────────────────────────

const getRiderOrders = async (riderId) => {
  return await Order.find({ riderId }).sort({ createdAt: -1 });
};

// ─────────────────────────────────────────────────────────────────────────────
//  UPDATE ORDER STATUS
// ─────────────────────────────────────────────────────────────────────────────

const updateOrderStatus = async (orderId, status, note = '') => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');

  if (!Object.values(ORDER_STATUS).includes(status)) {
    throw new Error('Invalid order status');
  }

  order.addTimeline(status, note);

  // when confirmed → request delivery
  if (status === ORDER_STATUS.CONFIRMED) {
    try {
      const delivery = await requestDelivery({
        orderId:         order._id,
        address:         order.address,
        addressLocation: order.addressLocation,
      });
      order.deliveryId    = delivery.deliveryId;
      order.riderId       = delivery.rider?.id    || null;
      order.riderSnapshot = {
        name:  delivery.rider?.name  || null,
        phone: delivery.rider?.phone || null,
      };
    } catch {
      console.warn('⚠️  Delivery request failed for order:', orderId);
    }
  }

  await order.save();
  return order;
};

// ─────────────────────────────────────────────────────────────────────────────
//  CANCEL ORDER
// ─────────────────────────────────────────────────────────────────────────────

const cancelOrder = async (orderId, userId, role) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');

  if (role !== 'admin' && order.userId !== userId) {
    throw new Error('Not authorized to cancel this order');
  }

  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    throw new Error(`Cannot cancel order at status: ${order.status}`);
  }

  if (order.deliveryId) {
    try {
      await cancelDelivery(order.deliveryId);
    } catch {
      console.warn('⚠️  Delivery cancel failed for:', order.deliveryId);
    }
  }

  order.addTimeline(ORDER_STATUS.CANCELLED, 'Cancelled by user');
  await order.save();
  return order;
};

// ─────────────────────────────────────────────────────────────────────────────
//  UPDATE PAYMENT  (called by Payment Service webhook)
// ─────────────────────────────────────────────────────────────────────────────

const updatePayment = async ({ orderId, paymentId, paymentStatus }) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');

  order.paymentId     = paymentId;
  order.paymentStatus = paymentStatus;

  if (paymentStatus === 'paid') {
    order.addTimeline(ORDER_STATUS.CONFIRMED, 'Payment successful');
  } else if (paymentStatus === 'failed') {
    order.addTimeline(ORDER_STATUS.CANCELLED, 'Payment failed');
  }

  await order.save();
  return order;
};

// ─────────────────────────────────────────────────────────────────────────────
//  UPDATE RIDER STATUS  (called by Delivery Service webhook)
// ─────────────────────────────────────────────────────────────────────────────

const updateRiderStatus = async ({ orderId, riderId, riderStatus, riderSnapshot }) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');

  order.riderId     = riderId;
  order.riderStatus = riderStatus;

  if (riderSnapshot) order.riderSnapshot = riderSnapshot;

  if (riderStatus === 'PICKED_UP') {
    order.addTimeline(ORDER_STATUS.OUT_FOR_DELIVERY, 'Rider picked up order');
  } else if (riderStatus === 'DELIVERED') {
    order.addTimeline(ORDER_STATUS.DELIVERED, 'Order delivered');
  }

  await order.save();
  return order;
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET ALL ORDERS  (admin only)
// ─────────────────────────────────────────────────────────────────────────────

const getAllOrders = async (filters = {}) => {
  const query = {};
  if (filters.status)       query.status       = filters.status;
  if (filters.restaurantId) query.restaurantId = filters.restaurantId;
  return await Order.find(query).sort({ createdAt: -1 });
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getRestaurantOrders,
  getRiderOrders,
  updateOrderStatus,
  cancelOrder,
  updatePayment,
  updateRiderStatus,
  getAllOrders,
};