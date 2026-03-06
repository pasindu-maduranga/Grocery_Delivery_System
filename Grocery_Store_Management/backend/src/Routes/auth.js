// ─── routes/auth.js ──────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { login, getMe, logout } = require('../Controllers/authController');
const { authenticate } = require('../Middlewares/Auth');

router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

module.exports = router;