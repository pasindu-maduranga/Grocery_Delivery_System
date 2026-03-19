import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  ShoppingCart, Search, MapPin, User, Star, ChevronDown, 
  Leaf, Milk, Beef, Wheat, Citrus, Croissant, 
  Wine, Cookie, CheckCircle2
} from "lucide-react";
import { storefrontAPI } from "../api/storefrontApi";
import { useCart } from "../hooks/useCart";
import { toast } from "sonner";

const CATEGORIES = [
  { name: "All", icon: null },
  { name: "Fruits", icon: Citrus },
  { name: "Vegetables", icon: Leaf },
  { name: "Dairy", icon: Milk },
  { name: "Bakery", icon: Croissant },
  { name: "Meat", icon: Beef },
  { name: "Beverages", icon: Wine },
  { name: "Snacks", icon: Cookie },
  { name: "Grains", icon: Wheat },
];

export default function CustomerShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Filtering state
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [0, 50],
    inStockOnly: true,
    flashSales: false,
  });

  const { cartCount, handleAddToCart, addingId, cartItems, handleDecrement } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await storefrontAPI.getAll({ 
        limit: 50, 
        sort: '-createdAt' 
      });
      setProducts(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load storefront products");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryFilter = (cat) => {
    setFilters(prev => {
      const isSelected = prev.categories.includes(cat);
      if (isSelected) {
        return { ...prev, categories: prev.categories.filter(c => c !== cat) };
      }
      return { ...prev, categories: [...prev.categories, cat] };
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!p.isVisible) return false;
      
      const searchMatch = p.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
      const categoryMatch = selectedCategory === "All" || p.category === selectedCategory;
      const filterCategoryMatch = filters.categories.length === 0 || filters.categories.includes(p.category);
      const stockMatch = !filters.inStockOnly || p.stockQuantity > 0;
      const priceMatch = p.sellingPrice >= filters.priceRange[0] && p.sellingPrice <= filters.priceRange[1];

      return searchMatch && categoryMatch && filterCategoryMatch && stockMatch && priceMatch;
    });
  }, [products, searchQuery, selectedCategory, filters]);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      {/* Navbar */}
      <header className="border-b border-gray-100 py-4 px-6 sticky top-0 bg-white z-40 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black text-emerald-600 tracking-tight">
            <Leaf className="w-8 h-8 fill-emerald-600" />
            FreshCart
          </Link>

          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search for groceries, farm-fresh items..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-emerald-500 transition-colors text-sm font-medium"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-emerald-600 transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-sm">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Deliver To</p>
                <p className="font-bold flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                  Home <ChevronDown className="w-3 h-3" />
                </p>
              </div>
            </div>

            <Link to="/cart" className="relative p-2 text-gray-400 hover:text-emerald-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link to="/profile" className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 font-bold overflow-hidden border-2 border-emerald-200 hover:border-emerald-500 transition-colors">
               <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-lg">Filters</h3>
            <button 
              onClick={() => setFilters({ categories: [], priceRange: [0, 50], inStockOnly: true, flashSales: false })}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-8">
            {/* Categories Filter */}
            <div>
              <div className="flex items-center justify-between mb-4 cursor-pointer">
                <h4 className="font-bold text-sm">Categories</h4>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-3">
                {["Fruits", "Vegetables", "Dairy", "Meat", "Grains"].map(cat => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border ${filters.categories.includes(cat) ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300 group-hover:border-emerald-500'} flex items-center justify-center transition-colors`}>
                      {filters.categories.includes(cat) && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <div className="flex items-center justify-between mb-4 cursor-pointer">
                <h4 className="font-bold text-sm">Price Range</h4>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <input 
                type="range" 
                min="0" max="1000" 
                value={filters.priceRange[1]} 
                onChange={(e) => setFilters(p => ({ ...p, priceRange: [p.priceRange[0], Number(e.target.value)] }))}
                className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex items-center justify-between mt-4">
                 <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs font-bold w-20 text-center">LKR {filters.priceRange[0]}</div>
                 <span className="text-gray-400">-</span>
                 <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs font-bold w-20 text-center">LKR {filters.priceRange[1]}</div>
              </div>
            </div>

            {/* Availability */}
            <div>
              <div className="flex items-center justify-between mb-4 cursor-pointer">
                <h4 className="font-bold text-sm">Availability</h4>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-600">In Stock Only</span>
                  <div className={`w-10 h-5 rounded-full p-1 transition-colors ${filters.inStockOnly ? 'bg-emerald-600' : 'bg-gray-200'}`}>
                    <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${filters.inStockOnly ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-600">Flash Sales</span>
                  <div className={`w-10 h-5 rounded-full p-1 transition-colors ${filters.flashSales ? 'bg-orange-500' : 'bg-gray-200'}`}>
                    <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${filters.flashSales ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </div>
                </label>
              </div>
            </div>

            {/* Rating */}
            <div>
              <div className="flex items-center justify-between mb-4 cursor-pointer">
                <h4 className="font-bold text-sm">Rating</h4>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          
          {/* Promo Banner */}
          <div className="bg-emerald-800 rounded-3xl overflow-hidden mb-10 relative text-white">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 pointer-events-none">
              <svg viewBox="0 0 400 400" className="w-full h-full text-emerald-900 fill-current"><path d="M120,-146.5C158.4,-118.9,194.5,-85.4,213.2,-41.2C231.9,3,233.2,57.7,211.5,103.5C189.9,149.3,145.3,186,95.5,203.4C45.6,220.8,-9.5,218.8,-57.6,200.7C-105.7,182.6,-146.9,148.4,-172.6,105.1C-198.3,61.8,-208.7,9.3,-195.9,-38.7C-183.1,-86.7,-147.2,-130.3,-104.9,-156.4C-62.7,-182.5,-14.2,-191.1,14.6,-187.5C43.5,-183.9,81.6,-174.1,120,-146.5Z" transform="translate(200 200)"/></svg>
            </div>
            <div className="relative p-12 bg-gradient-to-r from-emerald-900 to-emerald-900/60 flex items-center justify-between">
              <div className="max-w-md">
                <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-black uppercase tracking-widest mb-4">Limited Time Offer</span>
                <h1 className="text-5xl font-black leading-tight mb-4">Farm Fresh<br/><span className="text-emerald-400">Vegetables</span></h1>
                <p className="text-emerald-100 mb-8 font-medium leading-relaxed">Organic hand-picked produce from local farms delivered to your door in under 60 minutes.</p>
                <div className="flex items-center gap-4">
                  <button className="bg-white text-emerald-900 hover:bg-emerald-50 px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl transition-colors">Shop Now</button>
                  <p className="text-2xl font-black text-emerald-300">Up to 15% <span className="text-sm font-medium text-emerald-200">Off</span></p>
                </div>
              </div>
              <div className="hidden lg:block relative z-10 w-64 h-64 scale-125 translate-x-12">
                 <img src="https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&q=80" alt="Fresh Tomatoes" className="w-full h-full object-cover rounded-full mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 shadow-2xl border-8 border-emerald-800" />
              </div>
            </div>
          </div>

          {/* Categories Buttons */}
          <div className="mb-10">
            <h3 className="text-xl font-black mb-6">Shop by Category</h3>
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
              {CATEGORIES.map((cat, idx) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border whitespace-nowrap transition-all ${
                      isSelected ? 'bg-emerald-700 border-emerald-700 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-500'
                    }`}
                  >
                    {Icon && <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />}
                    <span className="text-sm font-bold">{cat.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Popular Products Header */}
          <div className="mb-8">
            <h3 className="text-xl font-black mb-1">Popular Products</h3>
            <p className="text-sm text-gray-400 font-medium">Based on your recent browsing and history</p>
          </div>

          {/* Product Grid */}
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-[360px]"></div>
                ))}
             </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
               <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
               <p className="font-bold text-lg text-gray-800 mb-2">No products found</p>
               <p className="text-sm">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => {
                 const inCart = cartItems.find((i) => i.productId === product._id);
                 return (
                  <div key={product._id} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 p-4 relative group flex flex-col h-full">
                     {/* Badge */}
                     <div className="absolute top-6 right-6 z-10 bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">
                        -10%
                     </div>
                     
                     {/* Image */}
                     <div className="aspect-square bg-gray-50 rounded-[1rem] mb-4 overflow-hidden relative">
                        <img 
                          src={product.groceryItem?.image || 'https://via.placeholder.com/300?text=No+Image'} 
                          alt={product.displayName} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                     </div>

                     <div className="flex flex-col flex-1">
                        {/* Meta */}
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                           <span className="bg-gray-100 px-2 py-1 rounded-md">{product.category}</span>
                           {product.stockQuantity > 0 ? (
                             <span className="text-emerald-600">In Stock</span>
                           ) : (
                             <span className="text-red-500">Out of Stock</span>
                           )}
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-gray-900 leading-tight mb-1 group-hover:text-emerald-600 transition-colors line-clamp-2">
                           {product.displayName}
                        </h4>
                        <p className="text-xs text-gray-400 mb-2">per {product.groceryItem?.measuringUnit || 'Unit'}</p>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-4">
                           {[1,2,3,4,5].map(star => (
                              <Star key={star} className={`w-3 h-3 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-200'}`} />
                           ))}
                           <span className="text-xs text-gray-400 ml-1 font-medium">4.5 (131)</span>
                        </div>

                        {/* Price & Add to Cart */}
                        <div className="mt-auto">
                           <div className="flex items-end gap-2 mb-4">
                              <span className="text-2xl font-black text-gray-900">LKR {product.sellingPrice}</span>
                              {product.groceryItem?.unitPrice && (
                                <span className="text-sm font-bold text-gray-400 line-through mb-1">LKR {product.sellingPrice + 50}</span>
                              )}
                           </div>
                           
                           {inCart ? (
                             <div className="flex items-center justify-between bg-emerald-50 rounded-xl p-1">
                                <button 
                                  onClick={() => handleDecrement(product._id)}
                                  className="w-10 h-10 rounded-lg flex items-center justify-center text-emerald-700 bg-white shadow-sm hover:bg-emerald-100"
                                >-</button>
                                <span className="font-black text-emerald-900 w-8 text-center">{inCart.quantity}</span>
                                <button 
                                  onClick={() => handleAddToCart({ ...product, id: product._id, price: product.sellingPrice, name: product.displayName, category: product.category, stock: product.stockQuantity, isStorefront: true, image: product.groceryItem?.image })}
                                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-emerald-600 shadow-sm hover:bg-emerald-700"
                                >+</button>
                             </div>
                           ) : (
                             <button 
                               onClick={() => handleAddToCart({ ...product, id: product._id, price: product.sellingPrice, name: product.displayName, category: product.category, stock: product.stockQuantity, isStorefront: true, image: product.groceryItem?.image })}
                               disabled={product.stockQuantity <= 0 || addingId === product._id}
                               className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                                 product.stockQuantity <= 0 
                                   ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                   : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                               }`}
                             >
                                <ShoppingCart className="w-4 h-4" />
                                {addingId === product._id ? 'Adding...' : 'Add to Cart'}
                             </button>
                           )}
                        </div>
                     </div>
                  </div>
                 )
              })}
            </div>
          )}

          {/* Load More */}
          {!loading && filteredProducts.length > 0 && (
            <div className="mt-12 flex justify-center">
              <button className="px-8 py-3.5 border-2 border-emerald-600 text-emerald-700 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-xl shadow-emerald-600/10">
                Load More Products
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16 mt-20">
         <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
               <Link to="/" className="flex items-center gap-2 text-xl font-black text-emerald-600 tracking-tight mb-6">
                  <Leaf className="w-6 h-6 fill-emerald-600" />
                  FreshCart
               </Link>
               <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  FreshCart is dedicated to bringing the farmer's market experience directly to your digital doorstep. High quality, zero waste, and always fresh.
               </p>
            </div>
            <div>
               <h4 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-xs">Quick Links</h4>
               <ul className="space-y-4 text-sm text-gray-500 font-medium">
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">Track My Order</a></li>
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">Our Farms</a></li>
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">Subscription Box</a></li>
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">Gift Cards</a></li>
               </ul>
            </div>
            <div>
               <h4 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-xs">Trust & Safety</h4>
               <ul className="space-y-4 text-sm text-gray-500 font-medium">
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">100% Freshness Guarantee</a></li>
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">Free Delivery on orders over $50</a></li>
               </ul>
            </div>
            <div>
               <h4 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-xs">Customer Support</h4>
               <p className="text-sm text-gray-500 font-medium mb-6">Need help with your order? Our support team is available 24/7.</p>
               <button className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
                  <ShoppingCart className="w-5 h-5" /> Chat with Us
               </button>
            </div>
         </div>
      </footer>
    </div>
  );
}
