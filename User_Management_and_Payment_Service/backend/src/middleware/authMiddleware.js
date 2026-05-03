const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication token missing' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rapidcart_secret_key_2026');
        const userId = decoded.id || decoded.userId;

        // Robust case-insensitive check for administrative roles
        const roleFromToken = (decoded.role || '').toLowerCase();
        const roleNameFromToken = (decoded.roleName || '').toLowerCase();

        const isAdmin = decoded.userType === 'system_user' || 
                        roleFromToken === 'admin' || 
                        roleFromToken === 'superadmin' || 
                        decoded.isSuperAdmin || 
                        roleNameFromToken.includes('admin');

        if (isAdmin) {
            // Determine the normalized role
            let normalizedRole = 'admin';
            if (roleFromToken === 'superadmin') {
                normalizedRole = 'superadmin';
            } else if (roleFromToken && roleFromToken !== 'customer') {
                normalizedRole = roleFromToken;
            }

            req.user = { 
                _id: userId, 
                ...decoded,
                role: normalizedRole
            };
            req.token = token;
            return next();
        }

        const user = await User.findOne({ _id: userId });
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid authentication token' });
        }
        
        // Normalize DB role just in case
        if (user.role) user.role = user.role.toLowerCase();
        
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        res.status(401).json({ success: false, message: 'Please authenticate' });
    }
};

module.exports = auth;