import { Link } from "react-router-dom";
import { Package } from "lucide-react";

const WelcomeBanner = ({ userName, cartCount, cartTotal, loadingCart }) => (
  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-8 text-white shadow-lg shadow-green-200">
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">Hey, {userName} 👋</h1>
        <p className="text-green-100 text-sm">What fresh groceries would you like today?</p>

        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition-all"
        >
          <Package className="w-3.5 h-3.5" />
          View My Orders
        </Link>
      </div>
      <div className="flex gap-4">
        <div className="text-center bg-white/20 rounded-xl px-4 py-2">
          <div className="text-xl font-bold">{loadingCart ? "..." : cartCount}</div>
          <div className="text-xs text-green-100">Items in Cart</div>
        </div>
        <div className="text-center bg-white/20 rounded-xl px-4 py-2">
          <div className="text-xl font-bold">${loadingCart ? "..." : cartTotal.toFixed(2)}</div>
          <div className="text-xs text-green-100">Cart Total</div>
        </div>
      </div>
    </div>
  </div>
);

export default WelcomeBanner;