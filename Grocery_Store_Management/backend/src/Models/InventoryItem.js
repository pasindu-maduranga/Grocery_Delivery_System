const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  groceryItem:    { type: mongoose.Schema.Types.ObjectId, ref: 'GroceryItem', required: true, unique: true },
  totalQuantity:  { type: Number, default: 0, min: 0 },
  measuringUnit:  { type: String, required: true, trim: true },
  minLevel:       { type: Number, default: 0 },
  maxLevel:       { type: Number, default: 0 },
  reorderLevel:   { type: Number, default: 0 },
  preferredSupplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  alertSent:      { type: Boolean, default: false },
  lastRestockedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.models.InventoryItem || mongoose.model('InventoryItem', inventoryItemSchema);
