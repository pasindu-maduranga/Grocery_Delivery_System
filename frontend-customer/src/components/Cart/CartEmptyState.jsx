import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

const CartEmptyState = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-200" />
    <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
    <p className="text-gray-400 text-sm mb-6">Add some fresh groceries to get started!</p>
    <Link
      to="/dashboard"
      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md shadow-green-200"
    >
      <ShoppingCart className="w-4 h-4" />
      Browse Products
    </Link>
  </div>
);

export default CartEmptyState;