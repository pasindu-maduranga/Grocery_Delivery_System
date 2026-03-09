import { Tag, X } from "lucide-react";

const CouponBox = ({ coupon, couponCode, discount, couponLoading, onChange, onApply, onRemove }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
    <div className="flex items-center gap-2 mb-3">
      <Tag className="w-4 h-4 text-green-500" />
      <span className="font-semibold text-gray-700 text-sm">Apply Coupon</span>

      {couponCode && (
        <div className="ml-auto flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
          {couponCode} — {discount}% OFF
          <button onClick={onRemove} className="ml-1 hover:text-green-900">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>

    {!couponCode && (
      <>
        <div className="flex gap-2">
          <input
            type="text"
            value={coupon}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onApply()}
            placeholder="Enter coupon code (e.g. FRESH10)"
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={onApply}
            disabled={couponLoading}
            className="px-4 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-sm font-semibold rounded-xl transition-all"
          >
            {couponLoading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : "Apply"
            }
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Try: FRESH10, SAVE20, RAPIDCART</p>
      </>
    )}
  </div>
);

export default CouponBox;