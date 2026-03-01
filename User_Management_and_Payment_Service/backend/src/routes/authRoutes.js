const express = require('express');
const authRouter = express.Router();
const user = require('../controllers/authController');

//http://localhost:5003/api/auth/register
authRouter.post('/register' , user.registerNewUser);

module.exports = authRouter;