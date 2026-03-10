import { PackageCheck, ChevronRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const OrderSummary = ({
  cartCount, subtotal, discount, discountAmt,
  deliveryFee, total, couponCode,
  items, checkoutLoading, onCheckout,
}) => (
  <div className="space-y-4">
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({cartCount} items)</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({discount}% — {couponCode})</span>
            <span>-${discountAmt.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600">
          <span>Delivery Fee</span>
          <span>
            {deliveryFee === 0
              ? <span className="text-green-600 font-medium">FREE</span>
              : `$${deliveryFee}`
            }
          </span>
        </div>

        {deliveryFee > 0 && (
          <p className="text-xs text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg">
            Add ${(30 - subtotal).toFixed(2)} more for FREE delivery!
          </p>
        )}

        <div className="h-px bg-gray-100" />

        <div className="flex justify-between font-bold text-gray-800 text-base">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={() => onCheckout(items, total)}
        disabled={checkoutLoading || !items.length}
        className="w-full mt-5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-green-200 flex items-center justify-center gap-2"
      >
        {checkoutLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Redirecting to Payment Gateway...
          </>
        ) : (
          <>
            <PackageCheck className="w-5 h-5" />
            Proceed to Checkout · ${total.toFixed(2)}
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>

      <Link
        to="/dashboard"
        className="flex items-center justify-center gap-2 mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Continue Shopping
      </Link>
    </div>

    {/* Delivery note */}
    <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-sm text-green-700">
      <p className="font-semibold mb-1">🚀 Fast Delivery</p>
      <p className="text-green-600 text-xs">
        Your order will be delivered within 30-45 minutes of confirmation.
      </p>
    </div>
  </div>
);

export default OrderSummary;