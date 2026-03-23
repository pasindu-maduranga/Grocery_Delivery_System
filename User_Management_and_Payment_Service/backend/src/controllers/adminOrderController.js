const Order = require('../models/OrderModel');

// Get all orders for admin
const getAllOrders = async (req, res) => {
    try {
        // Build filter if needed (e.g., by status)
        const { status } = req.query;
        const filter = {};
        if (status && status !== 'All') {
            filter.status = status;
        }

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .populate('userId', 'name email phoneNo');

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ["placed", "confirmed", "processed", "prepared", "shipped", "pickup", "out for delivery", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getAllOrders,
    updateOrderStatus
};
