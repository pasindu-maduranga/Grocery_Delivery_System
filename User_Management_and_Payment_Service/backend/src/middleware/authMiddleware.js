const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication token missing' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id || decoded.userId;

        // If it's a system_user (from Grocery Store), we trust the token without local DB lookup
        if (decoded.userType === 'system_user' || decoded.role === 'admin') {
            req.user = { _id: userId, ...decoded };
            req.token = token;
            return next();
        }

        const user = await User.findOne({ _id: userId });
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid authentication token' });
        }
        
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Please authenticate' });
    }
};

module.exports = auth;