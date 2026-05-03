import { Link } from "react-router-dom";
import { ShoppingCart, Search, MapPin, User, ChevronDown, ShoppingBag, Leaf } from "lucide-react";

export default function ShopHeader({ searchQuery, setSearchQuery, cartCount }) {
  return (
    <header className="border-b border-gray-100 py-4 px-6 sticky top-0 bg-white z-40 shadow-sm">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6">
        <Link to="/dashboard" className="flex items-center gap-2 text-2xl font-black text-green-600 tracking-tight">
          <Leaf className="w-8 h-8 fill-green-600" />
          FreshCart
        </Link>

        <div className="flex-1 max-w-2xl hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for groceries, farm-fresh items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-green-500 transition-colors text-sm font-medium"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-green-600 transition-colors">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-sm">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Deliver To</p>
              <p className="font-bold flex items-center gap-1 group-hover:text-green-600 transition-colors">
                Home <ChevronDown className="w-3 h-3" />
              </p>
            </div>
          </div>

          <Link
            to="/orders"
            className="relative p-2 text-gray-400 hover:text-green-600 transition-colors"
            title="My Orders"
            aria-label="My Orders"
          >
            <ShoppingBag className="w-6 h-6" />
          </Link>

          <Link to="/cart" className="relative p-2 text-gray-400 hover:text-green-600 transition-colors">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          <Link to="/profile" className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold overflow-hidden border-2 border-green-200 hover:border-green-500 transition-colors">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}