const userService = require('../services/userService');
const filterUserFields = require('./filterUserController');
const mongoose = require("mongoose");
const axios = require('axios');

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:5004/api';

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
        res.status(400).json({ success: false, message: error.message });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        await userService.updatePassword(req.user, currentPassword, newPassword);
        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    return res.status(200).json({ success: true, avatarUrl });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDashboard = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            dashboardData: { user: req.user }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Use Order Service to get REAL customer orders
const getOrders = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const token = req.headers.authorization;

    const response = await axios.get(`${ORDER_SERVICE_URL}/orders/my-orders`, {
        headers: { Authorization: token }
    });

    res.status(200).json({
      success: true,
      orders: response.data.data || [],
    });
  } catch (error) {
    console.error("getOrders proxy error:", error.message);
    res.status(200).json({ success: true, orders: [] }); // Fallback to empty instead of error for UX
  }
};

const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude, address } = req.body;
        const location = await userService.updateLocation(req.user, latitude, longitude, address);
        res.status(200).json({ success: true, message: 'Location updated successfully', location });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
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