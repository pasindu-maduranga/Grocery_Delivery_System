import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FloatingCartButton = ({ cartCount, cartTotal }) => {
  const navigate = useNavigate();

  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <button
        onClick={() => navigate("/cart")}
        className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-4 rounded-2xl shadow-xl shadow-green-300 transition-all duration-200 hover:scale-105"
      >
        <ShoppingCart className="w-5 h-5" />
        View Cart ({cartCount} items) · ${cartTotal.toFixed(2)}
      </button>
    </div>
  );
};

export default FloatingCartButton;
