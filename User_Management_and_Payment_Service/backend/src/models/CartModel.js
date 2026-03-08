const mongoose = require("mongoose");
const cartItemSchema = require('./CartItem');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One cart per user
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    couponCode: {
      type: String,
      default: null,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Virtual fields (computed, not stored in DB)

//Total number of items in cart
cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((sum, item) => sum + item.qty, 0);
});

//Subtotal before discount
cartSchema.virtual("subtotal").get(function () {
  return parseFloat(
    this.items.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)
  );
});

// Discount amount in dollars
cartSchema.virtual("discountAmount").get(function () {
  return parseFloat(((this.subtotal * this.discount) / 100).toFixed(2));
});

// Free delivery over $30
cartSchema.virtual("deliveryFee").get(function () {
  return this.subtotal > 30 ? 0 : 5.99;
});

// Grand total
cartSchema.virtual("total").get(function () {
  return parseFloat(
    (this.subtotal - this.discountAmount + this.deliveryFee).toFixed(2)
  );
});

module.exports = mongoose.model("Cart", cartSchema);