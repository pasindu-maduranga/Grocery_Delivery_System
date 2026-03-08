import { CATEGORIES } from "../../constants/dashboardConstants";

const CategoryPills = ({ selectedCategory, onCategoryChange }) => (
  <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
    {CATEGORIES.map((cat) => (
      <button
        key={cat}
        onClick={() => onCategoryChange(cat)}
        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
          selectedCategory === cat
            ? "bg-green-500 text-white border-green-500 shadow-md shadow-green-200"
            : "bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-600"
        }`}
      >
        {cat}
      </button>
    ))}
  </div>
);

export default CategoryPills;