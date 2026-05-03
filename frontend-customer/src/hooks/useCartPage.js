import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getCart, updateCartItemQty, removeCartItem,
  clearCart, applyCartCoupon, removeCartCoupon,
} from "../api/cartApi";
import { processCheckout } from "../api/paymentApi";
import api from "../api/userApi";

export const useCartPage = () => {
  const [cart, setCart]                         = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [updatingId, setUpdatingId]             = useState(null);
  const [clearing, setClearing]                 = useState(false);
  const [coupon, setCoupon]                     = useState("");
  const [couponLoading, setCouponLoading]       = useState(false);
  const [checkoutLoading, setCheckoutLoading]   = useState(false);

  // New state for checkout
  const [isWithinColombo, setIsWithinColombo]   = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await getCart();
        const cartData = res.data.cart;
        setCart(cartData);
        setIsWithinColombo(cartData.isWithinColombo ?? true);
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
      toast.success(`${itemName} removed`);
    } catch (err) {
      toast.error("Failed to remove item");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Clear all items?")) return;
    setClearing(true);
    try {
      const res = await clearCart();
      setCart(res.data.cart);
    } catch (err) {
      toast.error("Failed to clear cart");
    } finally {
      setClearing(false);
    }
  };

  const updateLocationInCart = async (val) => {
    try {
      setIsWithinColombo(val);
      const res = await api.put("/cart/location", { isWithinColombo: val });
      setCart(res.data.cart);
    } catch (err) {
      toast.error("Cloud not update location");
    }
  };

  const handleCheckout = async (paymentMethod = 'stripe', extras = {}) => {
    if (!items?.length) return toast.error("Your cart is empty");
    setCheckoutLoading(true);
    try {
      const res = await processCheckout({
          paymentMethod,
          address: extras.address || "",
          phoneNo: extras.phoneNo || ""
      });

      if (paymentMethod === 'stripe' && res.data.url) {
          window.location.href = res.data.url;
      } else if (paymentMethod === 'cod') {
          toast.success("Order placed successfully!");
          window.location.href = "/orders";
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Checkout failed");
      setCheckoutLoading(false);
    }
  };

  const items       = cart?.items         || [];
  const subtotal    = cart?.subtotal      ?? 0;
  const discountAmt = cart?.discountAmount ?? 0;
  const deliveryFee = cart?.deliveryFee   ?? (isWithinColombo ? 200 : 350);
  const total       = cart?.total         ?? (subtotal - discountAmt + deliveryFee);
  const discount    = cart?.discount      ?? 0;
  const couponCode  = cart?.couponCode    ?? null;
  const cartCount   = cart?.totalItems    ?? 0;

  return {
    items, subtotal, discountAmt, deliveryFee,
    total, discount, couponCode, cartCount,
    loading, updatingId, clearing,
    coupon, setCoupon, couponLoading, checkoutLoading,
    isWithinColombo, setIsWithinColombo: updateLocationInCart,
    handleUpdateQty, handleRemoveItem, handleClearCart,
    handleCheckout,
  };
};