import { ShoppingCart } from "lucide-react";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products, cartItems, addingId, onAdd, onDecrement }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No products found</p>
        <p className="text-sm">Try a different search or category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          inCart={cartItems.find((i) => i.productId === product.id)}
          isAdding={addingId === product.id}
          onAdd={onAdd}
          onDecrement={onDecrement}
        />
      ))}
    </div>
  );
};

export default ProductGrid;