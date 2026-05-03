import { ShoppingCart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CartEmptyState = () => (
  <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white shadow-xl shadow-green-100/60 p-16 text-center">
    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
      <ShoppingCart className="w-10 h-10 text-green-600" />
    </div>
    <h2 className="text-2xl font-black text-gray-800 mb-2">Your cart is empty</h2>
    <p className="text-gray-500 text-sm mb-6">Add some fresh groceries to get started.</p>

    <Link
      to="/dashboard"
      className="inline-flex items-center gap-2 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-green-200"
    >
      <Sparkles className="w-4 h-4" />
      Browse Products
    </Link>
  </div>
);

export default CartEmptyState;