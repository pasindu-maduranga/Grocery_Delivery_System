const express = require('express');
const router = express.Router();
const { authenticate } = require('../Middlewares/Auth');
const { getAdminNotifications, getSupplierNotifications, markAdminRead, markSupplierRead } = require('../Controllers/notificationController');

router.use(authenticate);

router.get('/admin', getAdminNotifications);
router.get('/supplier', getSupplierNotifications);
router.patch('/admin/:id/read', markAdminRead);
router.patch('/supplier/:id/read', markSupplierRead);

module.exports = router;
