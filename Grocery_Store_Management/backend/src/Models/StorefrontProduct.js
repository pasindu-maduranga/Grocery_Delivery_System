const mongoose = require('mongoose');

const storefrontProductSchema = new mongoose.Schema({
  groceryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'GroceryItem', required: true, unique: true },
  inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },

  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  groceryType: { type: String },
  measuringUnit: { type: String },

  purchasePricePerUnit: { type: Number, required: true }, // what admin paid supplier
  sellingPricePerUnit: { type: Number, required: true },  // what customers pay
  profitPerUnit: { type: Number },
  markupPercent: { type: Number },

  stockQuantity: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  syncedAt: { type: Date, default: Date.now },
  syncedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'SystemUser' },
}, { timestamps: true });

module.exports = mongoose.models.StorefrontProduct || mongoose.model('StorefrontProduct', storefrontProductSchema);
