import { Link } from "react-router-dom";
import {
  Leaf,
  ShoppingCart,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

export default function ShopFooter() {
  return (
    <footer className="bg-green-100 border-t border-gray-100 py-16 mt-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-black text-emerald-600 tracking-tight mb-6"
            >
              <Leaf className="w-6 h-6 fill-emerald-600" />
              FreshCart
            </Link>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6 max-w-md">
              FreshCart is dedicated to bringing the farmer&apos;s market experience directly to your digital doorstep.
            </p>
            <button className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
              <ShoppingCart className="w-5 h-5" /> Chat with Us
            </button>
          </div>

          <div>
            <h4 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-xs">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm font-medium text-gray-600">
              <li><Link to="/" className="hover:text-emerald-600">Home</Link></li>
              <li><Link to="/shop" className="hover:text-emerald-600">Shop</Link></li>
              <li><Link to="/orders" className="hover:text-emerald-600">My Orders</Link></li>
              <li><Link to="/cart" className="hover:text-emerald-600">Cart</Link></li>
              <li><Link to="/profile" className="hover:text-emerald-600">Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-xs">
              Shop Categories
            </h4>
            <ul className="space-y-3 text-sm font-medium text-gray-600">
              <li><Link to="/shop?category=Fruits" className="hover:text-emerald-600">Fruits</Link></li>
              <li><Link to="/shop?category=Vegetables" className="hover:text-emerald-600">Vegetables</Link></li>
              <li><Link to="/shop?category=Dairy" className="hover:text-emerald-600">Dairy</Link></li>
              <li><Link to="/shop?category=Meat" className="hover:text-emerald-600">Meat</Link></li>
              <li><Link to="/shop?category=Bakery" className="hover:text-emerald-600">Bakery</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-xs">
              Contact
            </h4>
            <ul className="space-y-4 text-sm font-medium text-gray-600">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-emerald-600" />
                <span>123 Market Street, Colombo</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <a href="tel:+94112345678" className="hover:text-emerald-600">+94 11 234 5678</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                <a href="mailto:support@freshcart.com" className="hover:text-emerald-600">
                  support@freshcart.com
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <p className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3">
                Newsletter
              </p>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-3 py-2 text-sm outline-none"
                />
                <button className="px-4 bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-medium">
            © {new Date().getFullYear()} FreshCart. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <a href="#" className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-emerald-600 hover:border-emerald-200">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-emerald-600 hover:border-emerald-200">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-emerald-600 hover:border-emerald-200">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}