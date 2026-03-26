import Navbar from "../components/Navbar";
import CartHeader from "../components/Cart/CartHeader";
import CartEmptyState from "../components/Cart/CartEmptyState";
import CartItemCard from "../components/Cart/CartItemCard";
import CouponBox from "../components/Cart/CouponBox";
import OrderSummary from "../components/Cart/OrderSummary";
import { useCartPage } from "../hooks/useCartPage";

const Cart = () => {
  const {
    items,
    subtotal,
    discountAmt,
    deliveryFee,
    total,
    discount,
    couponCode,
    cartCount,
    loading,
    updatingId,
    clearing,
    coupon,
    setCoupon,
    couponLoading,
    checkoutLoading,
    handleUpdateQty,
    handleRemoveItem,
    handleClearCart,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleCheckout,
  } = useCartPage();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-gray-500">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-green-50 via-white to-emerald-50">
      <Navbar cartCount={cartCount} />

      <div className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 bg-green-200/40 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute top-40 -right-20 w-80 h-80 bg-emerald-200/40 blur-3xl rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <CartHeader
          cartCount={cartCount}
          hasItems={items.length > 0}
          clearing={clearing}
          onClear={handleClearCart}
        />

        {items.length === 0 ? (
          <CartEmptyState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItemCard
                  key={item.productId}
                  item={item}
                  isUpdating={updatingId === item.productId}
                  onUpdateQty={handleUpdateQty}
                  onRemove={handleRemoveItem}
                />
              ))}
              <CouponBox
                coupon={coupon}
                couponCode={couponCode}
                discount={discount}
                couponLoading={couponLoading}
                onChange={setCoupon}
                onApply={handleApplyCoupon}
                onRemove={handleRemoveCoupon}
              />
            </div>

            <OrderSummary
              cartCount={cartCount}
              subtotal={subtotal}
              discount={discount}
              discountAmt={discountAmt}
              deliveryFee={deliveryFee}
              total={total}
              couponCode={couponCode}
              items={items}
              checkoutLoading={checkoutLoading}
              onCheckout={handleCheckout}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
