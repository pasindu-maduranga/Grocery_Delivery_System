import { useState, useEffect, useMemo } from "react";
import { storefrontAPI } from "../api/storefrontApi";
import { useCart } from "../hooks/useCart";
import { toast } from "sonner";

import ShopHeader from "../components/Dashboard/Header";
import ShopSidebarFilters from "../components/Dashboard/Sidebar";
import PromoBanner from "../components/Dashboard/Promo";
import CategoryChips from "../components/Dashboard/CategoryChips";
import ProductGrid from "../components/Dashboard/ProductGrid";
import ShopFooter from "../components/Dashboard/Footer";
import { DEFAULT_FILTERS, CATEGORIES } from "../constants/dashboardConstants";

export default function CustomerShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const { cartCount, handleAddToCart, addingId, cartItems, handleDecrement } =
    useCart();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await storefrontAPI.getAll({
          limit: 50,
          sort: "-createdAt",
        });
        setProducts(res?.data?.data || []);
      } catch {
        toast.error("Failed to load storefront products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();

    return products.filter((p) => {
      if (!p?.isActive) return false;

      const searchMatch = p.name?.toLowerCase().includes(q);
      const categoryMatch =
        selectedCategory === "All" || p.groceryType === selectedCategory;
      const filterCategoryMatch =
        filters.categories.length === 0 ||
        filters.categories.includes(p.groceryType);
      const stockMatch = !filters.inStockOnly || p.stockQuantity > 0;
      const priceMatch =
        p.sellingPricePerUnit >= filters.priceRange[0] &&
        p.sellingPricePerUnit <= filters.priceRange[1];

      const flashMatch =
        !filters.flashSales ||
        Boolean(p.isFlashSale || p.flashSale || p.discountPercentage > 0);

      return (
        searchMatch &&
        categoryMatch &&
        filterCategoryMatch &&
        stockMatch &&
        priceMatch &&
        flashMatch
      );
    });
  }, [products, searchQuery, selectedCategory, filters]);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      <ShopHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cartCount}
      />

      <main className="max-w-350 mx-auto px-6 py-8 flex flex-col lg:flex-row gap-10">
        <ShopSidebarFilters filters={filters} setFilters={setFilters} />

        <div className="flex-1 min-w-0">
          <PromoBanner />

          <CategoryChips
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />

          <div className="mb-8">
            <h3 className="text-xl font-black mb-1">Popular Products</h3>
            <p className="text-sm text-gray-400 font-medium">
              Based on your recent browsing and history
            </p>
          </div>

          <ProductGrid
            loading={loading}
            products={filteredProducts}
            cartItems={cartItems}
            addingId={addingId}
            onAddToCart={handleAddToCart}
            onDecrement={handleDecrement}
          />
        </div>
      </main>

      <ShopFooter />
    </div>
  );
}
