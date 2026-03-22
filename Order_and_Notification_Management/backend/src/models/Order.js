const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String },
  name:      { type: String, required: true },
  qty:       { type: Number, required: true, min: 1 },
  price:     { type: Number, required: true },
  image:     { type: String },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type:     String,
    required: true,
    unique:   true,
  },
  customerId:    { type: String, required: true },
  customerName:  { type: String, required: true },
  customerEmail: { type: String },
  customerPhone: { type: String },

  items: [orderItemSchema],

  totalAmount:   { type: Number, required: true },
  shippingCost:  { type: Number, default: 0 },

  status: {
    type:    String,
    enum:    ['pending', 'confirmed', 'processing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },

  paymentStatus: {
    type:    String,
    enum:    ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },

  paymentMethod: { type: String },

  shippingAddress: {
    street:  { type: String },
    city:    { type: String },
    state:   { type: String },
    zip:     { type: String },
    country: { type: String },
  },

  notes:        { type: String },
  adminNotes:   { type: String },

  statusHistory: [
    {
      status:    { type: String },
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: String },
      note:      { type: String },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
