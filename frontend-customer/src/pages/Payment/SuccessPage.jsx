import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { clearCart } from "../../api/cartApi";

const PaymentSuccess = () => {

  // Clear cart after successful payment
  useEffect(() => {
    const clear = async () => {
      try {
        await clearCart();
      } catch {
        // silent — cart may already be cleared via webhook later
      }
    };
    clear();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">

        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-400 text-sm mb-8">
          Your order has been placed.
        </p>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md shadow-green-200"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
