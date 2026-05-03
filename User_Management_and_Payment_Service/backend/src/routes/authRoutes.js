const express = require('express');
const authRouter = express.Router();
const passport = require('passport');
const user = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');

authRouter.post('/register' , user.registerNewUser);
authRouter.post('/login', user.userLogin);
authRouter.post('/forgot-password', user.forgotAppPassword);
authRouter.post('/reset-password', user.resetUserPassword);

// Admin-only driver creation
authRouter.post('/admin/create-driver', authMiddleware, roleCheck(['admin', 'superadmin']), user.adminCreateDriver);

// Google OAuth
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), user.googleCallback);

module.exports = authRouter;