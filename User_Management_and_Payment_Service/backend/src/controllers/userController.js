const userService = require('../services/userService');
const filterUserFields = require('./filterUserController');
const Order = require('../models/OrderModel');

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
            user
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
        const avatarUrl = await userService.uploadAvatar(
            req.user,
            req.file
        );
        res.status(200).json({
            success: true,
            avatarUrl
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
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
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    updatePassword,
    uploadAvatar,
    getDashboard,
    getOrders
};