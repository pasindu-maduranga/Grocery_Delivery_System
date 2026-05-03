const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadAvatar = require('../middleware/uploadAvatarMiddleware');

//Protected user routes

//http://localhost:5003/api/user
userRouter.get('/', authMiddleware, userController.getProfile);

//http://localhost:5003/api/user/update-profile
userRouter.put('/update-profile', authMiddleware, userController.updateProfile);

//http://localhost:5003/api/user
userRouter.put('/', authMiddleware, userController.updateProfile);

//http://localhost:5003/api/user/update-password
userRouter.put('/update-password', authMiddleware, userController.updatePassword);

//http://localhost:5003/api/user/avatar
userRouter.patch('/avatar', authMiddleware, uploadAvatar.single('avatar'), userController.uploadAvatar);

//http://localhost:5003/api/user/dashboard
userRouter.get('/dashboard', authMiddleware, userController.getDashboard);

//http://localhost:5003/api/user/orders
userRouter.get('/orders', authMiddleware, userController.getOrders);

//http://localhost:5003/api/user/update-location
userRouter.patch('/update-location', authMiddleware, userController.updateLocation);

module.exports=userRouter;