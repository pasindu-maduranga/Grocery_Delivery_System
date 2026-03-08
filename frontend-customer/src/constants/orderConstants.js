import {
  ShoppingBag,
  CheckCircle,
  ChefHat,
  Truck,
  PackageCheck,
} from "lucide-react";

export const ORDER_STEPS = [
  { key: "placed", label: "Order Placed", icon: ShoppingBag },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "prepared", label: "Preparing", icon: ChefHat },
  { key: "pickup", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
];

export const STATUS_STYLES = {
  placed: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  confirmed: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  prepared: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  pickup: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  delivered: {
    bg: "bg-green-100",
    text: "text-green-700",
    dot: "bg-green-500",
  },
};

export const DUMMY_ORDERS = [
  {
    id: "ORD-2026-001",
    status: "pickup",
    placedAt: "2026-03-08T10:30:00",
    estimatedDelivery: "2026-03-08T11:15:00",
    total: 38.45,
    deliveryFee: 0,
    discount: 10,
    couponCode: "FRESH10",
    address: "123 Main Street, Apt 4B, New York, NY 10001",
    items: [
      { name: "Fresh Avocados", qty: 2, price: 3.99, image: "🥑" },
      { name: "Sourdough Bread", qty: 1, price: 4.99, image: "🍞" },
      { name: "Greek Yogurt", qty: 3, price: 3.99, image: "🫙" },
      { name: "Baby Spinach", qty: 2, price: 2.99, image: "🥬" },
    ],
  },
  {
    id: "ORD-2026-002",
    status: "prepared",
    placedAt: "2026-03-08T09:15:00",
    estimatedDelivery: "2026-03-08T10:00:00",
    total: 24.97,
    deliveryFee: 5.99,
    discount: 0,
    couponCode: null,
    address: "456 Oak Avenue, Brooklyn, NY 11201",
    items: [
      { name: "Whole Milk", qty: 2, price: 2.49, image: "🥛" },
      { name: "Free Range Eggs", qty: 1, price: 5.49, image: "🥚" },
      { name: "Cheddar Cheese", qty: 2, price: 4.49, image: "🧀" },
    ],
  },
  {
    id: "ORD-2026-003",
    status: "delivered",
    placedAt: "2026-03-07T14:20:00",
    estimatedDelivery: "2026-03-07T15:05:00",
    total: 52.18,
    deliveryFee: 0,
    discount: 20,
    couponCode: "SAVE20",
    address: "789 Pine Road, Queens, NY 11354",
    items: [
      { name: "Salmon Fillet", qty: 2, price: 12.99, image: "🐟" },
      { name: "Basmati Rice", qty: 1, price: 6.99, image: "🍚" },
      { name: "Cherry Tomatoes", qty: 3, price: 2.79, image: "🍅" },
    ],
  },
  {
    id: "ORD-2026-004",
    status: "confirmed",
    placedAt: "2026-03-08T11:45:00",
    estimatedDelivery: "2026-03-08T12:30:00",
    total: 18.96,
    deliveryFee: 5.99,
    discount: 0,
    couponCode: null,
    address: "321 Elm Street, Manhattan, NY 10002",
    items: [
      { name: "Orange Juice", qty: 2, price: 3.49, image: "🍊" },
      { name: "Chicken Breast", qty: 1, price: 8.99, image: "🍗" },
    ],
  },
];
