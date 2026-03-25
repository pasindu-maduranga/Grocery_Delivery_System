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
    const userId = req.user._id; // comes from authMiddleware

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("getOrders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
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