import { ChevronDown, CheckCircle2 } from "lucide-react";
import { DEFAULT_FILTERS, SIDEBAR_CATEGORIES } from "../../constants/dashboardConstants";

export default function ShopSidebarFilters({ filters, setFilters }) {
  const toggleCategory = (cat) => {
    setFilters((prev) => {
      const exists = prev.categories.includes(cat);
      return {
        ...prev,
        categories: exists ? prev.categories.filter((c) => c !== cat) : [...prev.categories, cat],
      };
    });
  };

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black text-lg">Filters</h3>
        <button
          onClick={() => setFilters(DEFAULT_FILTERS)}
          className="text-xs font-bold text-green-600 hover:text-green-700 uppercase tracking-widest"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm">Categories</h4>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            {SIDEBAR_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center gap-3 text-left group"
              >
                <div className={`w-5 h-5 rounded border ${filters.categories.includes(cat) ? "bg-green-600 border-green-600" : "border-gray-300 group-hover:border-green-500"} flex items-center justify-center transition-colors`}>
                  {filters.categories.includes(cat) && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm">Price Range</h4>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="range"
            min="0"
            max="10000"
            value={filters.priceRange[1]}
            onChange={(e) =>
              setFilters((p) => ({ ...p, priceRange: [p.priceRange[0], Number(e.target.value)] }))
            }
            className="w-full accent-green-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm">Availability</h4>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setFilters((p) => ({ ...p, inStockOnly: !p.inStockOnly }))}
              className="w-full flex items-center justify-between"
            >
              <span className="text-sm font-medium text-gray-600">In Stock Only</span>
              <div className={`w-10 h-5 rounded-full p-1 transition-colors ${filters.inStockOnly ? "bg-green-600" : "bg-gray-200"}`}>
                <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${filters.inStockOnly ? "translate-x-4" : "translate-x-0"}`} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFilters((p) => ({ ...p, flashSales: !p.flashSales }))}
              className="w-full flex items-center justify-between"
            >
              <span className="text-sm font-medium text-gray-600">Flash Sales</span>
              <div className={`w-10 h-5 rounded-full p-1 transition-colors ${filters.flashSales ? "bg-orange-500" : "bg-gray-200"}`}>
                <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${filters.flashSales ? "translate-x-4" : "translate-x-0"}`} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}