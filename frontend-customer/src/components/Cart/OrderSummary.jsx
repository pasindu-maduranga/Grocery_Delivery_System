import { PackageCheck, ChevronRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const OrderSummary = ({
  cartCount,
  subtotal,
  discountAmt,
  deliveryFee,
  total,
  items,
  checkoutLoading,
  isWithinColombo,
  setIsWithinColombo,
  onCheckout,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("stripe"); // Default to Card

  return (
    <div className="space-y-4 lg:sticky lg:top-24 h-fit">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white shadow-md shadow-green-100/50 p-5">
        <h2 className="font-black text-gray-800 mb-4 text-lg">Order Summary</h2>

        {/* Location Selection */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
           <p className="text-xs font-bold text-gray-500 uppercase mb-3">Delivery Destination</p>
           <div className="flex gap-2">
              <button 
                onClick={() => setIsWithinColombo(true)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${isWithinColombo ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                  Colombo
              </button>
              <button 
                onClick={() => setIsWithinColombo(false)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${!isWithinColombo ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                  Out of Colombo
              </button>
           </div>
           <p className="text-[10px] text-gray-400 mt-2 italic">* Borella is our center. Out-of-Colombo takes 2 days.</p>
        </div>

        {/* Totals */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal ({cartCount} items)</span>
            <span>LKR {subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span className="font-semibold text-gray-800">LKR {deliveryFee.toFixed(2)}</span>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="flex justify-between font-black text-gray-800 text-lg">
            <span>Total</span>
            <span className="text-green-600">LKR {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mt-6">
           <p className="text-xs font-bold text-gray-500 uppercase mb-3 text-center">Select Payment Method</p>
           <div className="space-y-2">
               <button 
                  onClick={() => setPaymentMethod('stripe')}
                  className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl transition-all ${paymentMethod === 'stripe' ? 'border-green-500 bg-green-50 ring-2 ring-green-100' : 'border-gray-200 hover:border-gray-300'}`}
               >
                  <span className="text-sm font-semibold">Credit/Debit Card</span>
                  <div className={`w-4 h-4 rounded-full border ${paymentMethod === 'stripe' ? 'bg-green-500 border-green-500 ring-2 ring-offset-1 ring-green-500' : 'border-gray-300'}`} />
               </button>

               <button 
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl transition-all ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50 ring-2 ring-green-100' : 'border-gray-200 hover:border-gray-300'}`}
               >
                  <span className="text-sm font-semibold">Cash on Delivery (COD)</span>
                  <div className={`w-4 h-4 rounded-full border ${paymentMethod === 'cod' ? 'bg-green-500 border-green-500 ring-2 ring-offset-1 ring-green-500' : 'border-gray-300'}`} />
               </button>
           </div>
        </div>

        <button
          onClick={() => onCheckout(paymentMethod)}
          disabled={checkoutLoading || !items.length}
          className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-green-300 disabled:to-emerald-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-200 flex flex-col items-center justify-center gap-1"
        >
          {checkoutLoading ? (
             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5" />
                <span>Place Order · LKR {total.toFixed(2)}</span>
              </div>
              <span className="text-[10px] opacity-80 font-medium">Using {paymentMethod === 'stripe' ? 'Stripe Gateway' : 'COD'}</span>
            </>
          )}
        </button>

        <Link
          to="/dashboard"
          className="flex items-center justify-center gap-2 mt-4 text-sm text-green-600 hover:text-green-700 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSummary;