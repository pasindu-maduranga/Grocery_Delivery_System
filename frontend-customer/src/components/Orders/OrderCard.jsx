import { useState } from "react";
import { Calendar, MapPin, ChevronDown, ChevronUp, Tag, Package } from "lucide-react";
import OrderProgressBar from "./OrderProgressBar";
import OrderStatusBadge from "./OrderStatusBadge";

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  const placedDate = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const placedTime = new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  
  // Logic for estimated delivery (e.g., 45 minutes after creation)
  const estDate = new Date(new Date(order.createdAt).getTime() + 45 * 60000);
  const estTime = estDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-100 transition-all duration-200 overflow-hidden">

      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Order ID</span>
              <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-lg">#{order._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {placedDate} at {placedTime}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                {order.items.length} {order.items.length === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <span className="text-lg font-bold text-gray-800">LKR {order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <OrderProgressBar status={order.status} />

        {/* Status Message */}
        {order.status !== "delivered" && order.status !== "cancelled" && (
          <p className="text-xs text-center text-gray-400 mt-3">
            Expected delivery by <span className="text-green-600 font-semibold">{estTime}</span>
          </p>
        )}
        {order.status === "delivered" && (
          <p className="text-xs text-center text-green-600 font-semibold mt-3">
            ✅ Delivered successfully
          </p>
        )}
        {order.status === "cancelled" && (
          <p className="text-xs text-center text-red-500 font-semibold mt-3">
            ❌ Order cancelled
          </p>
        )}
      </div>

      {/* Expandable Details */}
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50/30">

          {/* Delivery Address */}
          {order.address && (
            <div className="flex gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium mb-0.5">Delivery Address</p>
                <p>{order.address}</p>
              </div>
            </div>
          )}

          {/* Items List */}
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-tight">Items Ordered</p>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                      {item.image?.startsWith('http') ? (
                         <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                         <span className="text-xl">{item.image || '🛒'}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.qty} × LKR {item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-700">
                    LKR {(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 text-sm space-y-2.5 shadow-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>LKR {order.subtotal?.toFixed(2) || (order.totalAmount - (order.deliveryFee || 0)).toFixed(2)}</span>
            </div>
            {(order.discount || 0) > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Coupon discount
                </span>
                <span>-{order.discount}%</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Delivery Fee</span>
              <span>{(order.deliveryFee || 0) === 0 ? <span className="text-green-600 font-medium">FREE</span> : `LKR ${order.deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between font-bold text-gray-900 text-base">
              <span>Order Total</span>
              <span className="text-green-600">LKR {order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expand Toggle */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-gray-400 hover:text-green-600 hover:bg-green-50/50 border-t border-gray-100 transition-all uppercase tracking-widest"
      >
        {expanded ? (
          <><ChevronUp className="w-4 h-4" /> Hide Details</>
        ) : (
          <><ChevronDown className="w-4 h-4" /> View Details</>
        )}
      </button>
    </div>
  );
};

export default OrderCard;