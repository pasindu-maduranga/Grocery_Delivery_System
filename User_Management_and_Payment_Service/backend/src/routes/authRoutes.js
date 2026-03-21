const express = require('express');
const authRouter = express.Router();
const passport = require('passport');
const user = require('../controllers/authController');

//http://localhost:5003/api/auth/register
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                 token:
 *                   type: string
 *       400:
 *         description: Registration failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
authRouter.post('/register' , user.registerNewUser);

//http://localhost:5003/api/auth/login
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email: { type: string, format: email, example: sewmisenarath@gmail.com }
 *               password: { type: string, format: password, example: Test123456 }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 user: { type: object }
 *                 token: { type: string }
 *       401:
 *         description: Invalid credentials
 */
authRouter.post('/login', user.userLogin);

// Google OAuth: Start
//http://localhost:5003/api/auth/google
/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth consent screen
 */
authRouter.get(
    '/google',
    passport.authenticate(
        'google', 
        { scope: ['profile', 'email'] }
    )
);

// Google OAuth: Callback
//http://localhost:5003/api/auth/google/callback
/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback endpoint
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to frontend with JWT token on success
 *       401:
 *         description: Authentication failed
 */
authRouter.get(
    '/google/callback',
    passport.authenticate(
        'google', 
        { failureRedirect: '/' }
    ),
    user.googleCallback 
);

//http://localhost:5003/api/auth/forgot-password
/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email: { type: string, format: email, example: user@example.com }
 *     responses:
 *       200:
 *         description: Password reset link sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *       400:
 *         description: Invalid email or error
 */
authRouter.post('/forgot-password', user.forgotAppPassword);

//http://localhost:5003/api/auth/reset-password
/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset user password using token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - password
 *             properties:
 *               email: { type: string, format: email, example: user@example.com }
 *               token: { type: string, example: "reset-token" }
 *               password: { type: string, format: password, example: "NewPassword123" }
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *       400:
 *         description: Invalid input or error
 */
authRouter.post('/reset-password', user.resetUserPassword);

module.exports = authRouter;