const cartService = require("../services/cartService");

// GET /api/cart
// Returns the current user's cart with all computed totals
const getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user._id);

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/cart/add
// Adds a product to cart or increments qty if already exists
// Body: { productId, name, price, image, category, unit, qty }
const addItem = async (req, res) => {
  try {
    const cart = await cartService.addItem(req.user._id, req.body);

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/cart/item/:productId
// Updates the quantity of a specific item
// Body: { qty }
const updateItemQty = async (req, res) => {
  try {
    const { productId } = req.params;
    const qty = Number(req.body.qty);

    if (qty === undefined || qty === null) {
      return res.status(400).json({
        success: false,
        message: "Quantity is required",
      });
    }

    const cart = await cartService.updateItemQty(req.user._id, productId, qty);

    res.status(200).json({
      success: true,
      message: qty <= 0 ? "Item removed from cart" : "Item quantity updated",
      cart,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/cart/item/:productId
// Removes a specific item from the cart
const removeItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await cartService.removeItem(req.user._id, productId);

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/cart/clear
// Clears all items from cart (called after order is placed)
const clearCart = async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.user._id);

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// POST /api/cart/coupon
// Applies a discount coupon to the cart
// Body: { couponCode }
const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const cart = await cartService.applyCoupon(req.user._id, couponCode);

    res.status(200).json({
      success: true,
      message: `Coupon "${cart.couponCode}" applied! ${cart.discount}% off`,
      cart,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/cart/coupon
// Removes applied coupon from cart
const removeCoupon = async (req, res) => {
  try {
    const cart = await cartService.removeCoupon(req.user._id);

    res.status(200).json({
      success: true,
      message: "Coupon removed",
      cart,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCart,
  addItem,
  updateItemQty,
  removeItem,
  clearCart,
  applyCoupon,
  removeCoupon,
};