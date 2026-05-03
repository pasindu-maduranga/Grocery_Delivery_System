const express = require('express');
const paymentRouter = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

paymentRouter.post('/process-checkout', authMiddleware, paymentController.processCheckout);
paymentRouter.post('/verify-checkout', paymentController.verifyCheckout);

module.exports=paymentRouter;