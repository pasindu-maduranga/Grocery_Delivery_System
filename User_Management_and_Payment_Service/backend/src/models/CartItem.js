const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: [true, "Product ID is required"],
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    qty: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    image: {
      type: String,
      default: "🛒",
    },
    category: {
      type: String,
      default: "General",
    },
    unit: {
      type: String,
      default: "each",
    },
  },
  { _id: false }
);

module.exports = cartItemSchema;