import { Search, Filter } from "lucide-react";
import { CATEGORIES } from "../../constants/dashboardConstants";

const SearchFilter = ({ search, onSearchChange, selectedCategory, onCategoryChange }) => (
  <div className="flex flex-col sm:flex-row gap-3 mb-6">
    <div className="relative flex-1">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder="Search for groceries..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm text-sm"
      />
    </div>
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 shadow-sm">
      <Filter className="w-4 h-4 text-gray-400" />
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="py-3 text-sm text-gray-700 focus:outline-none bg-transparent"
      >
        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
      </select>
    </div>
  </div>
);

export default SearchFilter;