import { Star, Plus, Minus } from "lucide-react";
import { BADGE_STYLES } from "../../constants/dashboardConstants";

const ProductCard = ({ product, inCart, isAdding, onAdd, onDecrement }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200 overflow-hidden">
    {/* Image */}
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-center relative">
      <span className="text-5xl">{product.image}</span>
      <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE_STYLES[product.badgeColor]}`}>
        {product.badge}
      </span>
    </div>

    {/* Info */}
    <div className="p-3">
      <p className="text-xs text-gray-400 mb-0.5">{product.category}</p>
      <h3 className="text-sm font-semibold text-gray-800 mb-1 leading-tight">{product.name}</h3>
      <div className="flex items-center gap-1 mb-2">
        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        <span className="text-xs text-gray-500">{product.rating} ({product.reviews})</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-base font-bold text-gray-800">${product.price}</span>
          <span className="text-xs text-gray-400 ml-1">/ {product.unit}</span>
        </div>

        {inCart ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDecrement(product)}
              disabled={isAdding}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-5 text-center text-sm font-semibold text-gray-800">{inCart.qty}</span>
            <button
              onClick={() => onAdd(product)}
              disabled={isAdding}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-all"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAdd(product)}
            disabled={isAdding}
            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm"
          >
            {isAdding
              ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Plus className="w-3 h-3" />
            }
            Add
          </button>
        )}
      </div>
    </div>
  </div>
);

export default ProductCard;