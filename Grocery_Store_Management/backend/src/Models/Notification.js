const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type:       {
    type: String,
    enum: ['submission_received', 'submission_accepted', 'submission_rejected', 'reorder_alert', 'payment_received'],
    required: true
  },
  title:      { type: String, required: true },
  message:    { type: String, required: true },
  forAdmin:   { type: Boolean, default: false },
  forSupplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  submission: { type: mongoose.Schema.Types.ObjectId, ref: 'GrocerySubmission' },
  inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  isRead:     { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
