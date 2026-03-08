import api from "./userApi";

export const getCart = () => api.get("/cart");
export const addToCart = (payload) => api.post("/cart/add", payload);
export const updateCartItemQty = (productId, qty) =>
  api.put(`/cart/item/${productId}`, { qty });
export const removeCartItem = (productId) => api.delete(`/cart/item/${productId}`);
export const clearCart = () => api.delete("/cart/clear");
export const applyCartCoupon = (couponCode) => api.post("/cart/coupon", { couponCode });
export const removeCartCoupon = () => api.delete("/cart/coupon");