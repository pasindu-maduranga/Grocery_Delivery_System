import { useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import WelcomeBanner from "../components/Dashboard/WelcomeBanner";
import FeaturePills from "../components/Dashboard/FeaturePills";
import SearchFilter from "../components/Dashboard/SearchFilter";
import CategoryPills from "../components/Dashboard/CategoryPills";
import ProductGrid from "../components/Dashboard/ProductGrid";
import FloatingCartButton from "../components/Dashboard/FloatingCartButton";
import { useCart } from "../hooks/useCart";
import { DUMMY_PRODUCTS } from "../constants/dashboardConstants";

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.name?.split(" ")[0] || "there";

  const {
    cartItems,
    loadingCart,
    addingId,
    cartCount,
    cartTotal,
    handleAddToCart,
    handleDecrement,
  } = useCart();

  const filteredProducts = useMemo(
    () =>
      DUMMY_PRODUCTS.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory =
          selectedCategory === "All" || p.category === selectedCategory;
        return matchSearch && matchCategory;
      }),
    [search, selectedCategory],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeBanner
          userName={userName}
          cartCount={cartCount}
          cartTotal={cartTotal}
          loadingCart={loadingCart}
        />
        <FeaturePills />
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <CategoryPills
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <ProductGrid
          products={filteredProducts}
          cartItems={cartItems}
          addingId={addingId}
          onAdd={handleAddToCart}
          onDecrement={handleDecrement}
        />
        <FloatingCartButton cartCount={cartCount} cartTotal={cartTotal} />
      </div>
    </div>
  );
};

export default Dashboard;
