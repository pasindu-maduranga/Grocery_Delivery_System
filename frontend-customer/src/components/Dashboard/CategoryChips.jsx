export default function CategoryChips({ categories, selectedCategory, onSelect }) {
  return (
    <div className="mb-10">
      <h3 className="text-xl font-black mb-6">Shop by Category</h3>
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={idx}
              onClick={() => onSelect(cat.name)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-green-700 border-green-700 text-white shadow-lg"
                  : "bg-white border-gray-200 text-gray-600 hover:border-emerald-500"
              }`}
            >
              {Icon && <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-green-500"}`} />}
              <span className="text-sm font-bold">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}