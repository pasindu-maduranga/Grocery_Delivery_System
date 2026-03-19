const express = require('express');
const router = express.Router();
const { authenticate } = require('../Middlewares/Auth');
const {
  createPaymentIntent,
  confirmPayment,
  syncToStorefront,
  getAllTransactions,
  getMyTransactions,
  getAnalytics,
  getSupplierAnalytics,
} = require('../Controllers/paymentController');

router.use(authenticate);

// Admin routes
router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.post('/sync-to-storefront', syncToStorefront);
router.get('/transactions', getAllTransactions);
router.get('/analytics', getAnalytics);

// Supplier routes
router.get('/my-transactions', getMyTransactions);
router.get('/supplier-analytics', getSupplierAnalytics);

module.exports = router;
