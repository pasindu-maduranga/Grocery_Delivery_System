import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import OrderCard from "../components/Orders/OrderCard";
import OrdersEmptyState from "../components/Orders/OrdersEmptyState";
import { ORDER_STEPS } from "../constants/orderConstants";
import { getOrders } from "../api/userApi";

const normalizeStatus = (value = "") =>
  String(value).toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

const STATUS_FILTERS = ["All", ...ORDER_STEPS.map((s) => s.key)];

const Orders = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const res = await getOrders();
      const data = res?.data;

      const list = Array.isArray(data?.orders)
        ? data.orders
        : Array.isArray(data?.data?.orders)
        ? data.data.orders
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      const normalized = list.map((order) => ({
        ...order,
        status: normalizeStatus(order?.status),
      }));

      setOrders(normalized);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      if (!silent) toast.error(err?.response?.data?.message || "Failed to load orders");
      if (!silent) setOrders([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(false);
    const timer = setInterval(() => fetchOrders(true), 15000);
    return () => clearInterval(timer);
  }, [fetchOrders]);

  const filtered = orders.filter((o) =>
    activeFilter === "All"
      ? true
      : normalizeStatus(o.status) === normalizeStatus(activeFilter)
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
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
            <p className="text-sm text-gray-400">{orders.length} total orders</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {STATUS_FILTERS.map((filter) => {
            const label =
              filter === "All"
                ? "All"
                : ORDER_STEPS.find(
                    (s) => normalizeStatus(s.key) === normalizeStatus(filter)
                  )?.label || filter;

            const isActive = normalizeStatus(activeFilter) === normalizeStatus(filter);

            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                  isActive
                    ? "bg-green-500 text-white border-green-500 shadow-md shadow-green-200"
                    : "bg-white text-gray-500 border-gray-200 hover:border-green-300 hover:text-green-600"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <OrdersEmptyState />
        ) : (
          <div className="space-y-4">
            {filtered
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((order) => (
                <OrderCard key={order._id || order.id} order={order} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
