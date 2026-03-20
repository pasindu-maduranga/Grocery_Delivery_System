import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Select, Input } from './Shared'

const SUPPLY_CATEGORIES = [
  'Fruits','Vegetables','Dairy','Bakery','Meat','Beverages',
  'Frozen','Grains','Spices','Snacks','Seafood','Organic',
  'Herbs','Canned Goods','Condiments',
]
const UNITS = ['kg','g','ton','liter','piece','box','crate','dozen']

export default function SupplyCategoriesTab({ categories, addCategory, updateCategory, removeCategory }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">
        Add all product types you can supply. Selected categories determine which procurement requests you receive.
      </p>

      <div className="space-y-3">
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <Select
              className="flex-1"
              value={cat.category}
              onChange={e => updateCategory(i, 'category', e.target.value)}
            >
              {SUPPLY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>

            <Input
              type="number"
              className="w-24"
              value={cat.quantity}
              onChange={e => updateCategory(i, 'quantity', e.target.value)}
              placeholder="Qty"
              min={0}
              required
            />

            <Select
              className="w-24"
              value={cat.unit}
              onChange={e => updateCategory(i, 'unit', e.target.value)}
            >
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </Select>

            {categories.length > 1 && (
              <button
                type="button"
                onClick={() => removeCategory(i)}
                className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addCategory}
        className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-xs font-medium text-slate-400
          hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/40 flex items-center justify-center gap-1.5 transition-all"
      >
        <Plus size={14} /> Add Category
      </button>
    </div>
  )
}