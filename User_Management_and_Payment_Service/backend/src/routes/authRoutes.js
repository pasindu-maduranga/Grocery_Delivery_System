const express = require('express');
const authRouter = express.Router();
const passport = require('passport');
const user = require('../controllers/authController');

//http://localhost:5003/api/auth/register
authRouter.post('/register' , user.registerNewUser);

//http://localhost:5003/api/auth/login
authRouter.post('/login', user.userLogin);

// Google OAuth: Start
//http://localhost:5003/api/auth/google
authRouter.get(
    '/google',
    passport.authenticate(
        'google', 
        { scope: ['profile', 'email'] }
    )
);

// Google OAuth: Callback
//http://localhost:5003/api/auth/google/callback
authRouter.get(
    '/google/callback',
    passport.authenticate(
        'google', 
        { failureRedirect: '/' }
    ),
    user.googleCallback 
);

module.exports = authRouter;