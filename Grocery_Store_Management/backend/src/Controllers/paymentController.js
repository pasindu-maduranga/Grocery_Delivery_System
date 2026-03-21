const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../Models/Transaction');
const GrocerySubmission = require('../Models/GrocerySubmission');
const StorefrontProduct = require('../Models/StorefrontProduct');
const InventoryItem = require('../Models/InventoryItem');
const GroceryItem = require('../Models/GroceryItem');
const Notification = require('../Models/Notification');

/**
 * POST /api/payments/create-payment-intent
 * SuperAdmin creates a Stripe Checkout Session to pay a supplier
 */
const createPaymentIntent = async (req, res) => {
  try {
    const { submissionId } = req.body;
    if (!submissionId) return res.status(400).json({ success: false, message: 'submissionId required' });

    const submission = await GrocerySubmission.findById(submissionId)
      .populate('groceryItem', 'name measuringUnit image groceryType unitPrice')
      .populate('supplier', 'businessName contactPersonName email');

    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
    if (submission.status !== 'accepted') return res.status(400).json({ success: false, message: 'Only accepted submissions can be paid' });

    // Check if already paid
    const existingTx = await Transaction.findOne({ submission: submissionId, paymentStatus: 'succeeded' });
    if (existingTx) return res.status(400).json({ success: false, message: 'Payment already completed for this submission' });

    const amountLKR = submission.totalPrice;

    // Create a pending transaction record first to track the session
    const transaction = await Transaction.create({
      type: 'payment_to_supplier',
      submission: submissionId,
      supplier: submission.supplier._id,
      groceryItem: submission.groceryItem?._id,
      amount: amountLKR,
      currency: 'LKR',
      paymentStatus: 'pending',
      quantityPurchased: submission.quantityAccepted || submission.quantitySent,
      unitPurchasePrice: submission.unitPrice,
      totalPurchaseCost: amountLKR,
      supplierRevenue: amountLKR,
      paidBy: req.user._id,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'lkr',
          product_data: {
            name: `Payout: ${submission.groceryItem?.name || 'Inventory Submission'}`,
            description: `Supplier: ${submission.supplier.businessName}`,
            metadata: {
              submissionId: submissionId.toString(),
              supplierId: submission.supplier._id.toString(),
            }
          },
          unit_amount: Math.round(amountLKR * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/grocery-submissions?session_id={CHECKOUT_SESSION_ID}&submission_id=${submissionId}`,
      cancel_url: `${process.env.FRONTEND_URL}/grocery-submissions`,
      metadata: {
        transactionId: transaction._id.toString(),
        submissionId: submissionId.toString(),
      }
    });

    // Update transaction with session ID
    transaction.stripePaymentIntentId = session.id; 
    await transaction.save();

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      transactionId: transaction._id,
    });
  } catch (err) {
    console.error('createPaymentIntent error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/payments/confirm
 * Called after Stripe Checkout redirects back to frontend
 */
const confirmPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, message: 'sessionId required' });

    // Verify with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: `Payment not completed. Status: ${session.payment_status}` });
    }

    // Update transaction
    const transaction = await Transaction.findOneAndUpdate(
      { stripePaymentIntentId: sessionId },
      {
        paymentStatus: 'succeeded',
        stripeChargeId: session.payment_intent, // This is the actual payment intent ID created by the session
      },
      { new: true }
    ).populate('supplier', 'businessName email')
     .populate('groceryItem', 'name');

    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction record not found' });

    // Update submission
    const submission = await GrocerySubmission.findByIdAndUpdate(
      transaction.submission, 
      { isPaid: true, paidAt: new Date(), transaction: transaction._id },
      { new: true }
    );

    // Notify supplier
    await Notification.create({
      type: 'payment_received',
      title: 'Settlement Received',
      message: `Payment of LKR ${transaction.amount.toLocaleString()} for ${transaction.groceryItem?.name} has been processed.`,
      forSupplier: transaction.supplier._id,
      transaction: transaction._id,
      link: '/supplier/submissions'
    });

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      transaction,
      submission
    });
  } catch (err) {
    console.error('confirmPayment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/payments/sync-to-storefront
 * Admin syncs paid inventory items to storefront with markup
 */
const syncToStorefront = async (req, res) => {
  try {
    const { transactionId, submissionId, sellingPrice } = req.body;
    
    let transaction;
    // Find by either transactionId or submissionId
    if (transactionId) {
      transaction = await Transaction.findById(transactionId);
    } else if (submissionId) {
      transaction = await Transaction.findOne({ submission: submissionId, paymentStatus: 'succeeded' });
    }

    if (!transaction) return res.status(404).json({ success: false, message: 'Completed transaction not found' });
    
    const groceryItem = await GroceryItem.findById(transaction.groceryItem);
    if (!groceryItem) return res.status(404).json({ success: false, message: 'Associated grocery item not found' });

    const purchasePrice = transaction.unitPurchasePrice;
    const sellPrice = parseFloat(sellingPrice);
    const profit = sellPrice - purchasePrice;
    const markup = ((profit / purchasePrice) * 100);

    // Create or Update storefront product
    const storefrontProduct = await StorefrontProduct.findOneAndUpdate(
      { groceryItem: groceryItem._id },
      {
        groceryItem: groceryItem._id,
        transaction: transaction._id,
        name: groceryItem.name,
        description: groceryItem.description,
        image: groceryItem.image,
        groceryType: groceryItem.groceryType,
        measuringUnit: groceryItem.measuringUnit,
        purchasePricePerUnit: purchasePrice,
        sellingPricePerUnit: sellPrice,
        profitPerUnit: profit,
        markupPercent: markup,
        stockQuantity: transaction.quantityPurchased,
        isActive: true,
        syncedAt: new Date(),
        syncedBy: req.user._id,
      },
      { upsert: true, new: true }
    );

    // Update transaction with storefront data & mark as synced
    await Transaction.findByIdAndUpdate(transaction._id, {
      sellingPricePerUnit: sellPrice,
      profitPerUnit: profit,
      totalProfit: profit * transaction.quantityPurchased,
      markupPercent: markup,
      adminRevenue: profit * transaction.quantityPurchased,
      isSyncedToStorefront: true,
      syncedAt: new Date(),
    });

    // Also update the submission
    await GrocerySubmission.findByIdAndUpdate(transaction.submission, {
      isSynced: true,
      sellingPrice: sellPrice,
      syncedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Product successfully published to storefront',
      storefrontProduct,
      profitSummary: {
        costPrice: purchasePrice,
        sellPrice: sellPrice,
        profitPerUnit: profit,
        margin: markup.toFixed(2) + '%'
      }
    });
  } catch (err) {
    console.error('syncToStorefront error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/payments/transactions
 * Get all transactions (admin view)
 */
const getAllTransactions = async (req, res) => {
  try {
    const { startDate, endDate, supplierId, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (supplierId) filter.supplier = supplierId;
    if (status) filter.paymentStatus = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59');
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('supplier', 'businessName contactPersonName email')
        .populate('groceryItem', 'name image measuringUnit groceryType')
        .populate('submission', 'quantitySent quantityAccepted totalPrice')
        .populate('paidBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Transaction.countDocuments(filter),
    ]);

    // Aggregate totals
    const totals = await Transaction.aggregate([
      { $match: { ...filter, paymentStatus: 'succeeded' } },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: '$amount' },
          totalProfit: { $sum: '$totalProfit' },
          totalTransactions: { $sum: 1 },
        }
      }
    ]);

    res.json({
      success: true,
      data: transactions,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      aggregates: totals[0] || { totalPaid: 0, totalProfit: 0, totalTransactions: 0 },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/payments/my-transactions
 * Get transactions for logged-in supplier
 */
const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ supplier: req.user._id })
      .populate('groceryItem', 'name image measuringUnit groceryType')
      .populate('submission', 'quantitySent quantityAccepted totalPrice')
      .sort({ createdAt: -1 });

    const totals = await Transaction.aggregate([
      { $match: { supplier: req.user._id, paymentStatus: 'succeeded' } },
      {
        $group: {
          _id: null,
          totalReceived: { $sum: '$supplierRevenue' },
          totalTransactions: { $sum: 1 },
        }
      }
    ]);

    res.json({
      success: true,
      data: transactions,
      aggregates: totals[0] || { totalReceived: 0, totalTransactions: 0 },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/payments/analytics
 * Get analytics data for charts
 */
const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const [
      monthlyRevenue,
      supplierRevenue,
      categoryRevenue,
      recentTransactions,
      profitTrend,
    ] = await Promise.all([
      // Monthly revenue by day
      Transaction.aggregate([
        { $match: { paymentStatus: 'succeeded', createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            totalPaid: { $sum: '$amount' },
            totalProfit: { $sum: '$totalProfit' },
            count: { $sum: 1 },
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Per-supplier revenue
      Transaction.aggregate([
        { $match: { paymentStatus: 'succeeded', createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$supplier',
            totalPaid: { $sum: '$amount' },
            transactions: { $sum: 1 },
          }
        },
        { $sort: { totalPaid: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'suppliers',
            localField: '_id',
            foreignField: '_id',
            as: 'supplier'
          }
        },
        { $unwind: '$supplier' },
        { $project: { supplierName: '$supplier.businessName', totalPaid: 1, transactions: 1 } }
      ]),

      // By grocery type
      Transaction.aggregate([
        { $match: { paymentStatus: 'succeeded', createdAt: { $gte: startDate } } },
        {
          $lookup: {
            from: 'groceryitems',
            localField: 'groceryItem',
            foreignField: '_id',
            as: 'item'
          }
        },
        { $unwind: { path: '$item', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$item.groceryType',
            totalPaid: { $sum: '$amount' },
            count: { $sum: 1 },
          }
        },
        { $sort: { totalPaid: -1 } }
      ]),

      // Recent transactions
      Transaction.find({ paymentStatus: 'succeeded' })
        .populate('supplier', 'businessName')
        .populate('groceryItem', 'name image')
        .sort({ createdAt: -1 })
        .limit(10),

      // Profit trend
      Transaction.aggregate([
        { $match: { paymentStatus: 'succeeded', createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            profit: { $sum: '$totalProfit' },
            revenue: { $sum: '$amount' },
          }
        },
        { $sort: { _id: 1 } }
      ]),
    ]);

    // Overall stats
    const overallStats = await Transaction.aggregate([
      { $match: { paymentStatus: 'succeeded' } },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: '$amount' },
          totalProfit: { $sum: '$totalProfit' },
          totalTransactions: { $sum: 1 },
          avgTransaction: { $avg: '$amount' },
        }
      }
    ]);

    const syncedCount = await Transaction.countDocuments({ isSyncedToStorefront: true, paymentStatus: 'succeeded' });

    res.json({
      success: true,
      data: {
        monthlyRevenue,
        supplierRevenue,
        categoryRevenue,
        recentTransactions,
        profitTrend,
        overallStats: overallStats[0] || { totalPaid: 0, totalProfit: 0, totalTransactions: 0, avgTransaction: 0 },
        syncedProductsCount: syncedCount,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/payments/supplier-analytics/:supplierId
 * Analytics for a specific supplier
 */
const getSupplierAnalytics = async (req, res) => {
  try {
    const supplierId = req.user._id; // supplier viewing their own

    const [transactions, monthlyTrend, stats] = await Promise.all([
      Transaction.find({ supplier: supplierId })
        .populate('groceryItem', 'name image groceryType')
        .sort({ createdAt: -1 })
        .limit(20),

      Transaction.aggregate([
        { $match: { supplier: supplierId, paymentStatus: 'succeeded' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            received: { $sum: '$supplierRevenue' },
            count: { $sum: 1 },
          }
        },
        { $sort: { _id: 1 } }
      ]),

      Transaction.aggregate([
        { $match: { supplier: supplierId, paymentStatus: 'succeeded' } },
        {
          $group: {
            _id: null,
            totalReceived: { $sum: '$supplierRevenue' },
            totalTransactions: { $sum: 1 },
            avgAmount: { $avg: '$supplierRevenue' },
          }
        }
      ]),
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        monthlyTrend,
        stats: stats[0] || { totalReceived: 0, totalTransactions: 0, avgAmount: 0 },
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  syncToStorefront,
  getAllTransactions,
  getMyTransactions,
  getAnalytics,
  getSupplierAnalytics,
};
