const mongoose = require('mongoose');

const grocerySubmissionSchema = new mongoose.Schema({
  supplier:         { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  groceryItem:      { type: mongoose.Schema.Types.ObjectId, ref: 'GroceryItem', required: true },
  quantitySent:     { type: Number, required: true, min: 1 },
  unitPrice:        { type: Number, required: true, min: 0 },
  discountPercent:  { type: Number, default: 0, min: 0, max: 100 },
  totalPrice:       { type: Number, required: true },
  note:             { type: String, trim: true },
  status:           { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  quantityAccepted: { type: Number },
  reviewedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'SystemUser' },
  reviewedAt:       { type: Date },
  reviewNote:       { type: String, trim: true },
  isRead:           { type: Boolean, default: false },
  isPaid:            { type: Boolean, default: false },
  paidAt:            { type: Date },
}, { timestamps: true });

module.exports = mongoose.models.GrocerySubmission || mongoose.model('GrocerySubmission', grocerySubmissionSchema);
