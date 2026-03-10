import { useState } from "react";
import { ArrowLeft, Package } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import OrderCard from "../components/Orders/OrderCard";
import OrdersEmptyState from "../components/Orders/OrdersEmptyState";
import { DUMMY_ORDERS, ORDER_STEPS } from "../constants/orderConstants";

const STATUS_FILTERS = ["All", ...ORDER_STEPS.map((s) => s.key)];

const Orders = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = DUMMY_ORDERS.filter((o) =>
    activeFilter === "All" ? true : o.status === activeFilter,
  );

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
              {DUMMY_ORDERS.length} total orders
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              label: "Active",
              count: DUMMY_ORDERS.filter((o) => o.status !== "delivered")
                .length,
              color: "text-orange-600 bg-orange-50 border-orange-100",
            },
            {
              label: "Delivered",
              count: DUMMY_ORDERS.filter((o) => o.status === "delivered")
                .length,
              color: "text-green-600 bg-green-50 border-green-100",
            },
            {
              label: "Total",
              count: DUMMY_ORDERS.length,
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
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
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
                    {DUMMY_ORDERS.filter((o) => o.status === filter).length}
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
            {/* Active orders first, then delivered */}
            {[...filtered]
              .sort((a, b) => (a.status === "delivered" ? 1 : -1))
              .map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
