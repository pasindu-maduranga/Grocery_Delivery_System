import { Plus, Minus, Trash2 } from "lucide-react";

const CartItemCard = ({ item, isUpdating, onUpdateQty, onRemove }) => (
  <div
    className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-white shadow-md shadow-green-100/50 p-4 flex items-center gap-4 transition-all ${
      isUpdating ? "opacity-60" : "hover:shadow-lg"
    }`}
  >
    <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
      {item.image?.startsWith("http") ? (
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-3xl">{item.image || "🛒"}</span>
      )}
    </div>

    <div className="flex-1 min-w-0 pr-2">
      <h3 className="font-bold text-gray-800 truncate text-base mb-0.5">{item.name}</h3>
      <p className="text-xs text-green-700 font-semibold bg-green-50 inline-block px-2 py-0.5 rounded-md mb-1.5">
        {item.category}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-gray-900 font-extrabold text-sm">LKR {(item.price * item.qty).toFixed(2)}</p>
        <span className="text-gray-400 text-xs font-medium">(LKR {item.price.toFixed(2)} / each)</span>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={() => onUpdateQty(item.productId, item.qty - 1)}
        disabled={isUpdating}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all disabled:cursor-not-allowed"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span className="w-6 text-center font-bold text-gray-800">
        {isUpdating ? (
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
        ) : (
          item.qty
        )}
      </span>

      <button
        onClick={() => onUpdateQty(item.productId, item.qty + 1)}
        disabled={isUpdating}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-all disabled:cursor-not-allowed"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>

    <button
      onClick={() => onRemove(item.productId, item.name)}
      disabled={isUpdating}
      className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition-all disabled:cursor-not-allowed"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

export default CartItemCard;