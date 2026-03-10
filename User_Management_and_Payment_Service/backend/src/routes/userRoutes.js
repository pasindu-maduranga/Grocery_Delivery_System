const express = require('express');
const userRouter = express.Router();
const multer = require('multer');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = multer({
    dest: '/uploads'
});

//Protected user routes

//http://localhost:5003/api/user
userRouter.get('/', authMiddleware, userController.getProfile);

//http://localhost:5003/api/user/update-profile
userRouter.put('/update-profile', authMiddleware, userController.updateProfile);

//http://localhost:5003/api/user/update-password
userRouter.put('/update-password', authMiddleware, userController.updatePassword);

//http://localhost:5003/api/user/avatar
userRouter.post('/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);

//http://localhost:5003/api/user/dashboard
userRouter.get('/dashboard', authMiddleware, userController.getDashboard);

module.exports=userRouter;