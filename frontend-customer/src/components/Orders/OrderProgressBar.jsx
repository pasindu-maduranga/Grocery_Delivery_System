import { ORDER_STEPS } from "../../constants/orderConstants";

const OrderProgressBar = ({ status }) => {
  const currentIndex = ORDER_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="relative mt-2 mb-1">

      {/* Background track */}
      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-100 rounded-full mx-[10%]" />

      {/* Filled progress track */}
      <div
        className="absolute top-5 left-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700 ease-in-out mx-[10%]"
        style={{ width: `${(currentIndex / (ORDER_STEPS.length - 1)) * 80}%` }}
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {ORDER_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent   = index === currentIndex;
          const isPending   = index > currentIndex;
          const Icon        = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center gap-2 flex-1">

              {/* Circle Icon */}
              <div className={`
                relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                border-2 transition-all duration-500
                ${isCompleted ? "bg-green-500 border-green-500 shadow-md shadow-green-200" : ""}
                ${isCurrent  ? "bg-white border-green-500 shadow-lg shadow-green-200 scale-110" : ""}
                ${isPending  ? "bg-white border-gray-200" : ""}
              `}>
                <Icon className={`w-4 h-4 ${isCompleted ? "text-white" : ""} ${isCurrent ? "text-green-500" : ""} ${isPending ? "text-gray-300" : ""}`} />

                {/* Pulse ring for current step */}
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-40" />
                )}
              </div>

              {/* Label */}
              <span className={`text-xs font-medium text-center leading-tight max-w-[60px]
                ${isCompleted ? "text-green-600" : ""}
                ${isCurrent  ? "text-green-700 font-semibold" : ""}
                ${isPending  ? "text-gray-400" : ""}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderProgressBar;