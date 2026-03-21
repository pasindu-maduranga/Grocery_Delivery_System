const mongoose = require('mongoose');

const groceryItemSchema = new mongoose.Schema({
  supplier:      { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  name:          { type: String, required: true, trim: true },
  groceryType:   {
    type: String,
    required: true,
    enum: [
      'Produce', 'Dairy', 'Meat & Seafood', 'Bakery',
      'Pantry / Dry Goods', 'Beverages', 'Frozen Foods',
      'Snacks', 'Herbs & Spices', 'Household & Cleaning',
      'Health & Personal Care', 'Baby & Kids'
    ]
  },
  availableQuantity: { type: Number, required: true, min: 0 },
  measuringUnit:     { type: String, required: true, trim: true },
  unitPrice:         { type: Number, required: true, min: 0 },
  image:             { type: String },
  description:       { type: String, trim: true },
  isActive:          { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.models.GroceryItem || mongoose.model('GroceryItem', groceryItemSchema);
