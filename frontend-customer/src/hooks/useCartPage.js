import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getCart, updateCartItemQty, removeCartItem,
  clearCart, applyCartCoupon, removeCartCoupon,
} from "../api/cartApi";
import { createCheckoutSession } from "../api/paymentApi";

export const useCartPage = () => {
  const [cart, setCart]                         = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [updatingId, setUpdatingId]             = useState(null);
  const [clearing, setClearing]                 = useState(false);
  const [coupon, setCoupon]                     = useState("");
  const [couponLoading, setCouponLoading]       = useState(false);
  const [checkoutLoading, setCheckoutLoading]   = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await getCart();
        setCart(res.data.cart);
      } catch {
        toast.error("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleUpdateQty = async (productId, newQty) => {
    setUpdatingId(productId);
    try {
      const res = await updateCartItemQty(productId, newQty);
      setCart(res.data.cart);
      if (newQty <= 0) toast.success("Item removed from cart");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (productId, itemName) => {
    setUpdatingId(productId);
    try {
      const res = await removeCartItem(productId);
      setCart(res.data.cart);
      toast.success(`${itemName} removed from cart`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove item");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Clear all items from your cart?")) return;
    setClearing(true);
    try {
      const res = await clearCart();
      setCart(res.data.cart);
      toast.success("Cart cleared");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to clear cart");
    } finally {
      setClearing(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return toast.error("Please enter a coupon code");
    setCouponLoading(true);
    try {
      const res = await applyCartCoupon(coupon.trim());
      setCart(res.data.cart);
      toast.success(res.data.message);
      setCoupon("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      const res = await removeCartCoupon();
      setCart(res.data.cart);
      toast.success("Coupon removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove coupon");
    }
  };

  const handleCheckout = async () => {
    if (!items?.length) return toast.error("Your cart is empty");
    setCheckoutLoading(true);
    try {
      // No need to pass items, backend will use stored cart
      const res = await createCheckoutSession();
      window.location.href = res.data.url;
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to start checkout");
      setCheckoutLoading(false);
    }
  };

  // Derived values — prefer backend-computed virtuals
  const items       = cart?.items         || [];
  const subtotal    = cart?.subtotal      ?? items.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = cart?.discountAmount ?? 0;
  const deliveryFee = cart?.deliveryFee   ?? (subtotal > 3000 ? 0 : 250); // LKR thresholds
  const total       = cart?.total         ?? (subtotal - discountAmt + deliveryFee);
  const discount    = cart?.discount      ?? 0;
  const couponCode  = cart?.couponCode    ?? null;
  const cartCount   = cart?.totalItems    ?? items.reduce((s, i) => s + i.qty, 0);

  return {
    // state
    items, subtotal, discountAmt, deliveryFee,
    total, discount, couponCode, cartCount,
    loading, updatingId, clearing,
    coupon, setCoupon, couponLoading, checkoutLoading,
    // handlers
    handleUpdateQty, handleRemoveItem, handleClearCart,
    handleApplyCoupon, handleRemoveCoupon, handleCheckout,
  };
};