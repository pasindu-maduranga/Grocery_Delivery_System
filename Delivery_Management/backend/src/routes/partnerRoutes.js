const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/deliveryPartnerController');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'grocery_secret');
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Public
router.post('/register', partnerController.registerPartner);
router.post('/login', partnerController.loginPartner);

// Management (ideally auth-protected, using authMiddleware for token validation)
router.get('/', partnerController.getAllPartners);
router.get('/roles', partnerController.getAllRoles);
router.get('/nearby', partnerController.getNearbyOnlinePartners);

// Approval workflow
router.patch('/:id/approve', authMiddleware, partnerController.approvePartner);
router.patch('/:id/reject', authMiddleware, partnerController.rejectPartner);
router.patch('/:id/toggle-active', authMiddleware, partnerController.toggleActive);
router.patch('/:id/toggle-lock', authMiddleware, partnerController.toggleLock);

// Driver self-service
router.put('/location-status', authMiddleware, partnerController.updateLocationAndStatus);

module.exports = router;
