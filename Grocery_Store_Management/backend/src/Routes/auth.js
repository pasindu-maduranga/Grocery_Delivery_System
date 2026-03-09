const express  = require('express');
const router   = express.Router();
const { login, supplierLogin, getMe, getSupplierMe, logout } = require('../Controllers/authController');
const { authenticate } = require('../Middlewares/Auth');

router.post('/login',login);
router.post('/supplier-login', supplierLogin);
router.get('/me',authenticate, getMe);
router.get('/supplier-me', authenticate, getSupplierMe);
router.post('/logout', authenticate, logout);

module.exports = router;