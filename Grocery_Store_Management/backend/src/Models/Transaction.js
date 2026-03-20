const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['payment_to_supplier', 'storefront_sync', 'refund'],
    required: true,
  },
  submission: { type: mongoose.Schema.Types.ObjectId, ref: 'GrocerySubmission' },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  groceryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'GroceryItem' },

  // Payment details
  amount: { type: Number, required: true }, // in LKR
  currency: { type: String, default: 'LKR' },
  stripePaymentIntentId: { type: String },
  stripeChargeId: { type: String },
  paymentStatus: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending',
  },

  // Purchase details (what admin bought from supplier)
  quantityPurchased: { type: Number },
  unitPurchasePrice: { type: Number },  // price paid to supplier per unit (LKR)
  totalPurchaseCost: { type: Number },  // total paid to supplier (LKR)

  // Storefront pricing (for sync)
  sellingPricePerUnit: { type: Number }, // price admin sells to customers
  profitPerUnit: { type: Number },
  totalProfit: { type: Number },
  markupPercent: { type: Number },

  // Revenue tracking
  supplierRevenue: { type: Number },  // what supplier received
  adminRevenue: { type: Number },     // profit for admin

  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'SystemUser' },
  notes: { type: String },

  isSyncedToStorefront: { type: Boolean, default: false },
  syncedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
