const express = require('express');
const paymentRouter = express.Router();
const paymentController = require('../controllers/paymentController');

paymentRouter.post('/create-checkout-session', paymentController);

module.exports=paymentRouter;