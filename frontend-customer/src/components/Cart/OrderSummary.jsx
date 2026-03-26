import { PackageCheck, ChevronRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const FREE_DELIVERY_THRESHOLD = 3000;

const OrderSummary = ({
  cartCount,
  subtotal,
  discount,
  discountAmt,
  deliveryFee,
  total,
  couponCode,
  items,
  checkoutLoading,
  onCheckout,
}) => {
  const remaining = Math.max(FREE_DELIVERY_THRESHOLD - subtotal, 0);
  const progress = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);

  return (
    <div className="space-y-4 lg:sticky lg:top-24 h-fit">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white shadow-md shadow-green-100/50 p-5">
        <h2 className="font-black text-gray-800 mb-4 text-lg">Order Summary</h2>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Free delivery progress</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {remaining > 0 ? (
            <p className="text-xs text-orange-600 mt-1.5">Add LKR {remaining.toFixed(2)} more for FREE delivery</p>
          ) : (
            <p className="text-xs text-green-600 mt-1.5 font-semibold">You unlocked FREE delivery 🎉</p>
          )}
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal ({cartCount} items)</span>
            <span>LKR {subtotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>
                Discount ({discount}% — {couponCode})
              </span>
              <span>-LKR {discountAmt.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>{deliveryFee === 0 ? <span className="text-green-600 font-semibold">FREE</span> : `LKR ${deliveryFee.toFixed(2)}`}</span>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="flex justify-between font-black text-gray-800 text-base">
            <span>Total</span>
            <span>LKR {total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={() => onCheckout()}
          disabled={checkoutLoading || !items.length}
          className="w-full mt-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-green-300 disabled:to-emerald-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
        >
          {checkoutLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Redirecting to Payment Gateway...
            </>
          ) : (
            <>
              <PackageCheck className="w-5 h-5" />
              Proceed to Checkout · LKR {total.toFixed(2)}
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>

        <Link
          to="/dashboard"
          className="flex items-center justify-center gap-2 mt-3 text-sm text-green-600 hover:text-green-700 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>

      <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-sm text-green-700">
        <p className="font-semibold mb-1">🚀 Fast Delivery</p>
        <p className="text-green-600 text-xs">Your order will be delivered within 30-45 minutes of confirmation.</p>
      </div>
    </div>
  );
};

export default OrderSummary;