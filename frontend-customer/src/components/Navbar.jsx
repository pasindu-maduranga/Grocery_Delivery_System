import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Package,
  Leaf
} from "lucide-react";

const Navbar = ({ cartCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));

  useEffect(() => {
    const refreshUser = () => setUser(JSON.parse(localStorage.getItem("user") || "{}"));

    window.addEventListener("storage", refreshUser);      // other tabs
    window.addEventListener("user-updated", refreshUser); // same tab

    return () => {
      window.removeEventListener("storage", refreshUser);
      window.removeEventListener("user-updated", refreshUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser({});
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? "bg-green-100 text-green-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center shadow-md shadow-green-200">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">
              Fresh<span className="text-green-500">Cart</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/dashboard" className={navLinkClass("/dashboard")}>
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link to="/cart" className={navLinkClass("/cart")}>
              <ShoppingCart className="w-4 h-4" />
              Cart
              {cartCount > 0 && (
                <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              to="/orders"
              className={`flex items-center gap-1.5 text-sm font-medium transition-all
                ${location.pathname === "/orders"
                  ? "text-green-600"
                  : "text-gray-600 hover:text-green-600"
                }`}
            >
              <Package className="w-4 h-4" />
              My Orders
            </Link>
            <Link to="/profile" className={navLinkClass("/profile")}>
              <User className="w-4 h-4" />
              Profile
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.name?.split(" ")[0] || "User"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            <Link to="/dashboard" className={navLinkClass("/dashboard")} onClick={() => setMenuOpen(false)}>
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link to="/cart" className={navLinkClass("/cart")} onClick={() => setMenuOpen(false)}>
              <ShoppingCart className="w-4 h-4" /> Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
            <Link to="/profile" className={navLinkClass("/profile")} onClick={() => setMenuOpen(false)}>
              <User className="w-4 h-4" /> Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;