import { ShoppingCart } from "lucide-react";
import ProductCard from "./Card";

export default function ProductGrid({
  loading,
  products,
  cartItems,
  addingId,
  onAddToCart,
  onDecrement,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-[360px]" />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="py-20 text-center text-gray-400">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="font-bold text-lg text-gray-800 mb-2">No products found</p>
        <p className="text-sm">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  const getCartItemForProduct = (productId) => {
    const pid = String(productId);
    return cartItems.find((i) => {
      const cid = String(i?.productId?._id || i?.productId || i?.id || "");
      return cid === pid;
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            inCart={getCartItemForProduct(product._id)}
            adding={addingId === product._id}
            onAddToCart={onAddToCart}
            onDecrement={onDecrement}
          />
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <button className="px-8 py-3.5 border-2 border-green-600 text-green-700 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all shadow-xl shadow-green-600/10">
          Load More Products
        </button>
      </div>
    </>
  );
}