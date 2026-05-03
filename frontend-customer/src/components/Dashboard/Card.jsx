import { Star, ShoppingCart } from "lucide-react";

export default function ProductCard({ product, inCart, adding, onAddToCart, onDecrement }) {
  const payload = {
    ...product,
    id: product._id,
    price: product.sellingPricePerUnit,
    name: product.name,
    category: product.groceryType,
    stock: product.stockQuantity,
    isStorefront: true,
    image: product.groceryItem?.image || product.image,
  };

  const inCartQty = Number(inCart?.quantity ?? inCart?.qty ?? 0);

  return (
    <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 p-4 relative group flex flex-col h-full">
      <div className="absolute top-6 right-6 z-10 bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">
        -10%
      </div>

      <div className="aspect-square bg-gray-50 rounded-[1rem] mb-4 overflow-hidden relative">
        <img
          src={product.groceryItem?.image || product.image || "https://via.placeholder.com/300?text=No+Image"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
          <span className="bg-gray-100 px-2 py-1 rounded-md">{product.groceryType}</span>
          <span className={product.stockQuantity > 0 ? "text-green-500" : "text-red-500"}>
            {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        <h4 className="font-bold text-gray-900 leading-tight mb-1 group-hover:text-green-500 transition-colors line-clamp-2">
          {product.name}
        </h4>

        <p className="text-xs text-gray-400 mb-2">
          per {product.groceryItem?.measuringUnit || product.measuringUnit || "Unit"}
        </p>

        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className={`w-3 h-3 ${star <= 4 ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-200"}`} />
          ))}
          <span className="text-xs text-gray-400 ml-1 font-medium">4.5 (131)</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-end gap-2 mb-4">
            <span className="text-2xl font-black text-gray-900">LKR {product.sellingPricePerUnit}</span>
            {product.purchasePricePerUnit && (
              <span className="text-sm font-bold text-gray-400 line-through mb-1">
                LKR {Math.round(product.sellingPricePerUnit * 1.15)}
              </span>
            )}
          </div>

          {inCartQty > 0 ? (
            <div className="flex items-center justify-between bg-emerald-50 rounded-xl p-1">
              <button
                onClick={() => onDecrement(payload)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-emerald-700 bg-white shadow-sm hover:bg-emerald-100"
              >
                -
              </button>
              <span className="font-black text-emerald-900 w-8 text-center">{inCartQty}</span>
              <button
                onClick={() => onAddToCart(payload)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-green-500 shadow-sm hover:bg-emerald-700"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(payload)}
              disabled={product.stockQuantity <= 0 || adding}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                product.stockQuantity <= 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-emerald-700 text-white shadow-lg shadow-green-500/20"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {adding ? "Adding..." : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}