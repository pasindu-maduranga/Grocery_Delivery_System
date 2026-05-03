import { Tag, X, Sparkles } from "lucide-react";

const CouponBox = ({ coupon, couponCode, discount, couponLoading, onChange, onApply, onRemove }) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white shadow-md shadow-green-100/50 p-4">
    <div className="flex items-center gap-2 mb-3">
      <Tag className="w-4 h-4 text-green-500" />
      <span className="font-bold text-gray-700 text-sm">Apply Coupon</span>

      {couponCode && (
        <div className="ml-auto flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          <Sparkles className="w-3 h-3" />
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
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
          />
          <button
            onClick={onApply}
            disabled={couponLoading}
            className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-green-300 disabled:to-emerald-300 text-white text-sm font-semibold rounded-xl transition-all"
          >
            {couponLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Apply"
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Try: FRESH10, SAVE20, RAPIDCART</p>
      </>
    )}
  </div>
);

export default CouponBox;