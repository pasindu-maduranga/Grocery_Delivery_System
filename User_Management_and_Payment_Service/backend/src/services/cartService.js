const Cart = require('../models/CartModel');

// TODO: Replace this comment block when Products API is ready
// const productRes = await axios.get(`http://localhost:5001/api/products/${productId}`);
// const { name, price, image, category, unit } = productRes.data.product;
// Then use those values instead of accepting them from req.body

// Valid coupon codes-move to DB collection later
const VALID_COUPONS = {
  FRESH10: 10,
  SAVE20: 20,
  RAPIDCART: 15,
};

// GET CART
// Finds the cart for a given userId. Creates an empty one if none exists.
const getCart = async (userId) => {
  let cart = await Cart.findOne({ userId });

  // Auto-create empty cart on first access
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  return cart;
};

// ADD ITEM
// Adds a product to cart. If product already exists → increments qty.
// productData should come from the Products microservice response.
const addItem = async (userId, productData) => {
    const { productId, name, price, image, category, unit } = productData;
    const qty = Number(productData.qty ?? 1);

  if (!productId || !name || price === undefined || Number.isNaN(Number(price))) {
    throw new Error("productId, name, and valid price are required");
  }

  if (!Number.isInteger(qty) || qty < 1) {
    throw new Error("Quantity must be a positive integer");
  }

  if (qty < 1) {
    throw new Error("Quantity must be at least 1");
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.productId === String(productId)
  );

  if (existingItem) {
    //Product already in cart - just increase qty
    existingItem.qty += qty;
  } else {
    //push to items array
    cart.items.push({ 
        productId: String(productId), 
        name, 
        price:Number(price), 
        image, 
        category, 
        unit, 
        qty 
    });
  }

  await cart.save();
  return cart;
};

// UPDATE ITEM QUANTITY
// Sets the qty of a specific cart item. Removes item if qty <= 0.
const updateItemQty = async (userId, productId, qty) => {
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId === String(productId)
  );

  if (itemIndex === -1) {
    throw new Error("Item not found in cart");
  }

  if (qty <= 0) {
    // Remove item if qty drops to 0 or below
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].qty = qty;
  }

  await cart.save();
  return cart;
};

// REMOVE ITEM
// Removes a single product from the cart completely.
const removeItem = async (userId, productId) => {
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const originalLength = cart.items.length;

  cart.items = cart.items.filter(
    (item) => item.productId !== String(productId)
  );

  if (cart.items.length === originalLength) {
    throw new Error("Item not found in cart");
  }

  await cart.save();
  return cart;
};

// CLEAR CART
// Removes all items from cart. Called after successful order placement.
const clearCart = async (userId) => {
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  cart.items = [];
  cart.couponCode = null;
  cart.discount = 0;

  await cart.save();
  return cart;
};

// APPLY COUPON
// Validates and applies a coupon code to the cart.
const applyCoupon = async (userId, couponCode) => {
  const code = couponCode?.trim()?.toUpperCase();

  if (!code) {
    throw new Error("Coupon code is required");
  }

  const discountValue = VALID_COUPONS[code];

  if (!discountValue) {
    throw new Error("Invalid or expired coupon code");
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  if (cart.items.length === 0) {
    throw new Error("Cannot apply coupon to an empty cart");
  }

  cart.couponCode = code;
  cart.discount = discountValue;

  await cart.save();
  return cart;
};

// REMOVE COUPON
// Clears any applied coupon from the cart.
const removeCoupon = async (userId) => {
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  cart.couponCode = null;
  cart.discount = 0;

  await cart.save();
  return cart;
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