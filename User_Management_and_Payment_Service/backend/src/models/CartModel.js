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
    isWithinColombo: {
      type: Boolean,
      default: true,
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

// Delivery Fee (200 within Colombo, 350 outside)
cartSchema.virtual("deliveryFee").get(function () {
  if (this.subtotal === 0) return 0;
  // Rule: Free delivery over 5000 LKR
  if (this.subtotal > 5000) return 0;
  return this.isWithinColombo ? 200 : 350;
});

// Grand total
cartSchema.virtual("total").get(function () {
  return parseFloat(
    (this.subtotal - this.discountAmount + this.deliveryFee).toFixed(2)
  );
});

module.exports = mongoose.model("Cart", cartSchema);