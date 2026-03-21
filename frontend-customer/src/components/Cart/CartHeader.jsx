import { ArrowLeft, Trash2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CartHeader = ({ cartCount, hasItems, clearing, onClear }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
          <p className="text-sm text-gray-500">
            {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>
      </div>

      {hasItems && (
        <button
          onClick={onClear}
          disabled={clearing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-all disabled:opacity-50"
        >
          {clearing
            ? <RefreshCw className="w-4 h-4 animate-spin" />
            : <Trash2 className="w-4 h-4" />
          }
          Clear Cart
        </button>
      )}
    </div>
  );
};

export default CartHeader;