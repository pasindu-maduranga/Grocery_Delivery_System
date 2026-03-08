const express = require("express");
const cartRouter = express.Router();
const cartController = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");

// All cart routes require authentication
cartRouter.use(authMiddleware);

/**
 * @route   GET /api/cart
 * @desc    Get current user's cart
 * @access  Private
 */
cartRouter.get("/", cartController.getCart);

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart (or increment qty)
 * @access  Private
 * @body    { productId, name, price, image, category, unit, qty }
 */
cartRouter.post("/add", cartController.addItem);

/**
 * @route   PUT /api/cart/item/:productId
 * @desc    Update quantity of a specific item
 * @access  Private
 * @body    { qty }
 */
cartRouter.put("/item/:productId", cartController.updateItemQty);

/**
 * @route   DELETE /api/cart/item/:productId
 * @desc    Remove a specific item from cart
 * @access  Private
 */
cartRouter.delete("/item/:productId", cartController.removeItem);

/**
 * @route   DELETE /api/cart/clear
 * @desc    Clear all items from cart
 * @access  Private
 */
cartRouter.delete("/clear", cartController.clearCart);

/**
 * @route   POST /api/cart/coupon
 * @desc    Apply a coupon code
 * @access  Private
 * @body    { couponCode }
 */
cartRouter.post("/coupon", cartController.applyCoupon);

/**
 * @route   DELETE /api/cart/coupon
 * @desc    Remove applied coupon
 * @access  Private
 */
cartRouter.delete("/coupon", cartController.removeCoupon);

module.exports = cartRouter;