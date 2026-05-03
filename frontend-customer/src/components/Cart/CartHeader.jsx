import { ArrowLeft, Trash2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CartHeader = ({ cartCount, hasItems, clearing, onClear }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2.5 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-600 hover:bg-white transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Your Cart</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {cartCount} {cartCount === 1 ? "item" : "items"} selected
          </p>
        </div>
      </div>

      {hasItems && (
        <button
          onClick={onClear}
          disabled={clearing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 bg-white/80 text-sm font-semibold transition-all disabled:opacity-50"
        >
          {clearing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Clear Cart
        </button>
      )}
    </div>
  );
};

export default CartHeader;