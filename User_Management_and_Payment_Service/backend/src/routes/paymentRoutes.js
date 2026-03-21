const express = require('express');
const paymentRouter = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

paymentRouter.post('/create-checkout-session', authMiddleware, paymentController.paymentStripe);
paymentRouter.post('/verify-checkout', paymentController.verifyCheckout);

module.exports=paymentRouter;