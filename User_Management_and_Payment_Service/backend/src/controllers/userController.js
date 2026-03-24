const userService = require('../services/userService');
const filterUserFields = require('./filterUserController');
const Order = require('../models/OrderModel');
const mongoose = require("mongoose");

const getProfile = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: filterUserFields(req.user)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const updateProfile = async (req, res) => {
    try {
        const user = await userService.updateProfile(req.user, req.body);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: filterUserFields(user)
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        await userService.updatePassword(
            req.user,
            currentPassword,
            newPassword
        );
        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`; // correct public URL path
    // ...save avatarUrl to DB for req.user...

    return res.status(200).json({ success: true, avatarUrl });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get user dashboard data
const getDashboard = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            dashboardData: {
                user: req.user,
            }
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get user orders
const getOrders = async (req, res) => {
    try {
        // prevent 304/cache for orders
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.set("Pragma", "no-cache");
        res.set("Expires", "0");
        res.set("Surrogate-Control", "no-store");

        const rawIds = [
            req.user?.id,
            req.user?.userId,
            req.user?._id,
            req.user?.sub,
            req.user?.user?._id,
        ].filter(Boolean);

        const rawEmails = [
            req.user?.email,
            req.user?.user?.email,
        ].filter(Boolean);

        const ids = [...new Set(rawIds.map((v) => String(v)))];
        const emails = [...new Set(rawEmails.map((v) => String(v).toLowerCase()))];

        const or = [];

        ids.forEach((id) => {
            // common flat fields
            or.push({ userId: id }, { customerId: id }, { user: id }, { createdBy: id });
            // common nested fields
            or.push(
                { "customer.id": id },
                { "customer.userId": id },
                { "user.id": id },
                { "user._id": id }
            );

            if (mongoose.Types.ObjectId.isValid(id)) {
                const oid = new mongoose.Types.ObjectId(id);
                or.push({ userId: oid }, { customerId: oid }, { user: oid }, { createdBy: oid });
                or.push({ "customer.id": oid }, { "customer.userId": oid }, { "user._id": oid });
            }
        });

        emails.forEach((email) => {
            or.push(
                { email },
                { userEmail: email },
                { customerEmail: email },
                { "customer.email": email },
                { "user.email": email }
            );
        });

        const query = or.length ? { $or: or } : {};
        const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.error("getOrders error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
};

const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude, address } = req.body;

        const location = await userService.updateLocation(
            req.user,
            latitude,
            longitude,
            address
        );

        res.status(200).json({
            success: true,
            message: 'Location updated successfully',
            location
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    updatePassword,
    uploadAvatar,
    getDashboard,
    getOrders,
    updateLocation,
};