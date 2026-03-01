const express = require('express');
const authRouter = express.Router();
const user = require('../controllers/authController');

//http://localhost:5003/api/auth/register
authRouter.post('/register' , user.registerNewUser);

//http://localhost:5003/api/auth/login
authRouter.post('/login', user.userLogin);


module.exports = authRouter;