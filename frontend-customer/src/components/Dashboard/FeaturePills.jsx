import { Leaf, Zap, Tag } from "lucide-react";

const PILLS = [
  {
    icon: <Leaf className="w-4 h-4" />,
    label: "100% Organic Options",
    color: "bg-green-50 text-green-700 border-green-200",
  },
  {
    icon: <Zap className="w-4 h-4" />,
    label: "Fast Delivery",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  {
    icon: <Tag className="w-4 h-4" />,
    label: "Best Prices",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
];

const FeaturePills = () => (
  <div className="flex flex-wrap gap-3 mb-8">
    {PILLS.map((pill) => (
      <div
        key={pill.label}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${pill.color}`}
      >
        {pill.icon} {pill.label}
      </div>
    ))}
  </div>
);

export default FeaturePills;
