import { Leaf, Milk, Beef, Wheat, Citrus, Croissant, Wine, Cookie } from "lucide-react";

export const CATEGORIES = [
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

export const SIDEBAR_CATEGORIES = ["Fruits", "Vegetables", "Dairy", "Meat", "Grains"];

export const DEFAULT_FILTERS = {
  categories: [],
  priceRange: [0, 10000],
  inStockOnly: false,
  flashSales: false,
};