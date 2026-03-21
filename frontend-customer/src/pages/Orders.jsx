import { useState, useEffect } from "react";
import { ArrowLeft, Package, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import OrderCard from "../components/Orders/OrderCard";
import OrdersEmptyState from "../components/Orders/OrdersEmptyState";
import { ORDER_STEPS } from "../constants/orderConstants";
import { getOrders } from "../api/userApi";

const STATUS_FILTERS = ["All", ...ORDER_STEPS.map((s) => s.key)];

const Orders = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getOrders();
        setOrders(res.data.orders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) =>
    activeFilter === "All" ? true : o.status === activeFilter,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
            <p className="text-sm text-gray-400">
              {orders.length} total orders
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              label: "Active",
              count: orders.filter((o) => o.status !== "delivered").length,
              color: "text-orange-600 bg-orange-50 border-orange-100",
            },
            {
              label: "Delivered",
              count: orders.filter((o) => o.status === "delivered").length,
              color: "text-green-600 bg-green-50 border-green-100",
            },
            {
              label: "Total",
              count: orders.length,
              color: "text-blue-600 bg-blue-50 border-blue-100",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl border px-4 py-3 text-center ${stat.color}`}
            >
              <p className="text-2xl font-bold">{stat.count}</p>
              <p className="text-xs font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {STATUS_FILTERS.map((filter) => {
            const label =
              filter === "All"
                ? "All"
                : ORDER_STEPS.find((s) => s.key === filter)?.label;
            const isActive = activeFilter === filter;

            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
                  ${
                    isActive
                      ? "bg-green-500 text-white border-green-500 shadow-md shadow-green-200"
                      : "bg-white text-gray-500 border-gray-200 hover:border-green-300 hover:text-green-600"
                  }`}
              >
                {label}
                {filter !== "All" && (
                  <span
                    className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20" : "bg-gray-100"}`}
                  >
                    {orders.filter((o) => o.status === filter).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        {filtered.length === 0 ? (
          <OrdersEmptyState />
        ) : (
          <div className="space-y-4">
            {filtered
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
