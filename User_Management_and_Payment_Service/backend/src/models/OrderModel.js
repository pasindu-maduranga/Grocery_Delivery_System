const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
  image: { type: String },
  category: { type: String },
  unit: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["placed", "confirmed", "processed", "prepared", "shipped", "pickup", "out for delivery", "delivered", "cancelled"],
      default: "placed",
    },
    paymentId: { type: String },
    paymentStatus: { type: String, default: "pending" },
    address: { type: String },
    phoneNo: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
