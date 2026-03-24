import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getCart, addToCart, updateCartItemQty } from "../api/cartApi";

export const useCart = () => {
  const [cartItems, setCartItems]     = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [addingId, setAddingId]       = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
         setLoadingCart(false);
         return;
      }
      try {
        const res = await getCart();
        setCartItems(res.data.cart.items || []);
      } catch {
        // silent — user may have an empty cart
      } finally {
        setLoadingCart(false);
      }
    };
    fetchCart();
  }, []);

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first to start adding items into your cart");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
      return;
    }

    setAddingId(product.id);
    try {
      const existing = cartItems.find((i) => i.productId === product.id);
      if (existing) {
        const res = await updateCartItemQty(product.id, existing.qty + 1);
        setCartItems(res.data.cart.items);
        toast.success(`${product.name} quantity updated!`);
      } else {
        const res = await addToCart({
          productId: product.id,
          name:      product.name,
          price:     product.price,
          image:     product.image,
          category:  product.category,
          unit:      product.unit,
          qty:       1,
        });
        setCartItems(res.data.cart.items);
        toast.success(`${product.name} added to cart!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update cart");
    } finally {
      setAddingId(null);
    }
  };

  const handleDecrement = async (productOrId) => {
    const productId =
      typeof productOrId === "string"
        ? productOrId
        : productOrId?._id || productOrId?.id || productOrId?.productId;

    if (!productId) return;
    setAddingId(productId);
    try {
      const existing = cartItems.find((i) => i.productId === productId);
      if (!existing) return;
      const newQty = existing.qty - 1;
      const res = await updateCartItemQty(productId, newQty);
      setCartItems(res.data.cart.items);
      toast.success(newQty === 0 ? `${name} removed!` : `${name} quantity updated!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update cart");
    } finally {
      setAddingId(null);
    }
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  return { cartItems, loadingCart, addingId, cartCount, cartTotal, handleAddToCart, handleDecrement };
};