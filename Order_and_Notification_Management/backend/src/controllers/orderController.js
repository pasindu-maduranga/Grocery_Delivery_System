const Order = require('../models/Order');
const Driver = require('../models/Driver');


// ─── Receive order from customer service ─────────────────────────────────────
const receiveOrder = async (req, res) => {
  try {
    const {
      orderId, customerId, customerName, customerEmail, customerPhone,
      items, totalAmount, shippingCost, paymentStatus, paymentMethod,
      shippingAddress, notes,
    } = req.body;

    // Upsert — if order already exists, update it; otherwise create
    const order = await Order.findOneAndUpdate(
      { orderId },
      {
        orderId, customerId, customerName, customerEmail, customerPhone,
        items, totalAmount, shippingCost: shippingCost || 0,
        paymentStatus: paymentStatus || 'unpaid',
        paymentMethod, shippingAddress, notes,
        $setOnInsert: { status: 'pending', statusHistory: [] },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({ success: true, data: order });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Order already exists' });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get all orders (admin) ────────────────────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      success: true,
      data: orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get customer's orders ────────────────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id })
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get single order ─────────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update order status (admin) ──────────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status, adminNotes, driverId } = req.body;

    const VALID = ['pending', 'confirmed', 'processing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!VALID.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Push to history
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user?.username || req.user?.id || 'admin',
      note: adminNotes || '',
    });

    order.status = status;
    order.adminNotes = adminNotes || order.adminNotes;
    if (driverId) {
      order.assignedDriverId = driverId;
      order.assignmentStatus = 'accepted';
    }
    await order.save();

    if (driverId && status === 'out_for_delivery') {
      await Driver.findByIdAndUpdate(driverId, { isAvailable: false });
    }

    // Sync back to User Management Service
    try {
      const axios = require('axios');
      const statusMap = {
        'pending': 'placed',
        'confirmed': 'confirmed',
        'processing': 'prepared',
        'ready': 'prepared',
        'out_for_delivery': 'pickup',
        'delivered': 'delivered',
        'cancelled': 'cancelled',
      };
      const userMgmtStatus = statusMap[status] || status;

      console.log(`[DEBUG] Syncing order ${order.orderId} to status: ${userMgmtStatus}`);
      const userMgmtBase = process.env.USER_SERVICE_URL || 'http://localhost:5003/api';
      console.log(`[DEBUG] Target URL: ${userMgmtBase}/admin/orders/status/${order.orderId}`);

      await axios.patch(`${userMgmtBase}/admin/orders/status/${order.orderId}`,
        { status: userMgmtStatus },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (syncErr) {
      console.error('[DEBUG] Sync failed:', syncErr.message);
    }

    return res.json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Order stats (admin dashboard) ────────────────────────────────────────────
const getOrderStats = async (req, res) => {
  try {
    const [total, pending, confirmed, processing, ready, outForDelivery, delivered, cancelled, revenue] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'confirmed' }),
        Order.countDocuments({ status: 'processing' }),
        Order.countDocuments({ status: 'ready' }),
        Order.countDocuments({ status: 'out_for_delivery' }),
        Order.countDocuments({ status: 'delivered' }),
        Order.countDocuments({ status: 'cancelled' }),
        Order.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
      ]);

    return res.json({
      success: true,
      data: {
        total, pending, confirmed, processing, ready,
        outForDelivery, delivered, cancelled,
        totalRevenue: revenue[0]?.total || 0,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Delete order (admin) ─────────────────────────────────────────────────────
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getReadyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'ready' }).sort({ createdAt: 1 });
    return res.json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ isAvailable: true })
      .select('_id name vehicleType licensePlate rating currentLocation');
    return res.json({ success: true, data: drivers });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  receiveOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  deleteOrder,
  getReadyOrders,
  getAvailableDrivers,
};
