import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const OrdersEmptyState = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
    <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <ShoppingBag className="w-10 h-10 text-green-300" />
    </div>
    <h2 className="text-xl font-bold text-gray-700 mb-2">No orders yet</h2>
    <p className="text-gray-400 text-sm mb-6">Looks like you haven't placed any orders. Start shopping!</p>
    <Link
      to="/dashboard"
      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md shadow-green-200"
    >
      <ShoppingBag className="w-4 h-4" />
      Browse Products
    </Link>
  </div>
);

export default OrdersEmptyState;