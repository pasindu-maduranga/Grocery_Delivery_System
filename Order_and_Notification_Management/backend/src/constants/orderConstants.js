// Centralized constants — import anywhere in order-service

const ORDER_STATUS = {
    PENDING:          "pending",
    PAYMENT_PENDING:  "payment_pending",
    CONFIRMED:        "confirmed",
    PREPARING:        "preparing",
    READY:            "ready",
    OUT_FOR_DELIVERY: "out_for_delivery",
    DELIVERED:        "delivered",
    COMPLETED:        "completed",
    CANCELLED:        "cancelled",
    DECLINED:         "declined",
  };
  
  const CANCELLABLE_STATUSES = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.PAYMENT_PENDING,
    ORDER_STATUS.CONFIRMED,
  ];
  
  const PAYMENT_STATUS = {
    PENDING:  "pending",
    PAID:     "paid",
    FAILED:   "failed",
    REFUNDED: "refunded",
  };
  
  const PAYMENT_METHODS = {
    COD:    "cod",
    CARD:   "card",
    WALLET: "wallet",
  };
  
  const RIDER_STATUS = {
    PENDING:   "PENDING",
    ACCEPTED:  "ACCEPTED",
    REJECTED:  "REJECTED",
    PICKED_UP: "PICKED_UP",
    DELIVERED: "DELIVERED",
  };
  
  const DELIVERY_TYPES = {
    STANDARD: "standard",
    EXPRESS:  "express",
  };
  
  const TAX_RATE         = 0.08;  // 8%
  const DEFAULT_SHIPPING = 0;
  
  module.exports = {
    ORDER_STATUS,
    CANCELLABLE_STATUSES,
    PAYMENT_STATUS,
    PAYMENT_METHODS,
    RIDER_STATUS,
    DELIVERY_TYPES,
    TAX_RATE,
    DEFAULT_SHIPPING,
  }; 