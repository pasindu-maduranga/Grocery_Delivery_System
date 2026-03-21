const express = require('express');
const userRouter = express.Router();
const {
  getAllUsers, getUserById, createUser, updateUser,
  toggleActive, toggleLock, resetPassword,
} = require('../Controllers/systemUserController');
const { authenticate, requireSuperAdmin } = require('../Middlewares/Auth');

userRouter.use(authenticate, requireSuperAdmin);

userRouter.get('/', getAllUsers);
userRouter.post('/', createUser);
userRouter.get('/:id', getUserById);
userRouter.put('/:id', updateUser);
userRouter.patch('/:id/toggle-active', toggleActive);
userRouter.patch('/:id/toggle-lock', toggleLock);
userRouter.patch('/:id/reset-password', resetPassword);

module.exports = { userRouter };
