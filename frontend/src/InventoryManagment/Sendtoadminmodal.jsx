import { useState } from 'react'
import { grocerySubmissionsAPI } from '../api/index'
import { Modal, FormField, Spinner } from '../components/common/index'
import { Send, ImageOff, Tag, ShoppingCart, IndianRupee, Info, AlertCircle } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

export default function SendToAdminModal({ item, onClose, onSent }) {
  const [form, setForm] = useState({
    quantitySent: '',
    unitPrice: item.unitPrice,
    discountPercent: 0,
    note: '',
  })
  const [saving, setSaving] = useState(false)

  const qty = Number(form.quantitySent) || 0
  const price = Number(form.unitPrice) || 0
  const discount = Number(form.discountPercent) || 0
  const discountedPrice = price * (1 - discount / 100)
  const totalPrice = qty * discountedPrice

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (qty > item.availableQuantity) return toast.error('Insufficient stock available')
    if (qty <= 0) return toast.error('Please enter a valid quantity')
    
    setSaving(true)
    try {
      await grocerySubmissionsAPI.send({
        groceryItemId: item._id,
        quantitySent: qty,
        unitPrice: price,
        discountPercent: discount,
        note: form.note,
      })
      toast.success('Inventory submission sent successfully')
      onSent()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit inventory')
    } finally { setSaving(false) }
  }

  return (
    <Modal open={true} onClose={onClose} title="Supply Submission" size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row min-h-[450px]">
        {/* Left Side - Context */}
        <div className="w-full md:w-[280px] bg-slate-50 p-6 border-r border-slate-100 flex flex-col">
           <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Product Summary</p>
              <div className="group relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-slate-200 mb-4 shadow-sm">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <ImageOff size={32} />
                  </div>
                )}
              </div>
              <h4 className="font-bold text-slate-800 line-clamp-1">{item.name}</h4>
              <p className="text-xs text-slate-500 mb-4">{item.groceryType}</p>
              
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1">
                 <p className="text-[10px] uppercase font-black text-emerald-600">Stock Status</p>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">Available:</span>
                    <span className="text-sm font-black text-emerald-900">{item.availableQuantity} {item.measuringUnit}</span>
                 </div>
              </div>
           </div>

           <div className="mt-auto p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 items-start">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                Ensure all quantities and prices are accurate. Misreporting may lead to rejection.
              </p>
           </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 p-8 bg-white flex flex-col">
          <div className="grid grid-cols-2 gap-5 mb-6">
            <div className="col-span-2">
              <FormField label={`Quantity to Supply (${item.measuringUnit})`}>
                <div className="relative">
                  <ShoppingCart className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    className="input pl-11 h-12 shadow-sm border-slate-200 font-bold" 
                    type="number" min="0.01" max={item.availableQuantity} step="0.01"
                    value={form.quantitySent} 
                    onChange={e => setForm(p => ({ ...p, quantitySent: e.target.value }))}
                    required 
                    placeholder={`Max: ${item.availableQuantity}`} 
                  />
                </div>
              </FormField>
            </div>

            <FormField label="Supply Price (LKR)">
               <div className="relative">
                 <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input 
                   className="input pl-11 h-12 shadow-sm border-slate-200 font-black text-emerald-700" 
                   type="number" min="0" step="0.01"
                   value={form.unitPrice} 
                   onChange={e => setForm(p => ({ ...p, unitPrice: e.target.value }))} 
                   required 
                 />
               </div>
            </FormField>

            <FormField label="Discount (%)">
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  className="input pl-11 h-12 shadow-sm border-slate-200" 
                  type="number" min="0" max="100" step="0.1"
                  value={form.discountPercent} 
                  onChange={e => setForm(p => ({ ...p, discountPercent: e.target.value }))} 
                />
              </div>
            </FormField>

            <div className="col-span-2">
               <FormField label="Note to Super Admin">
                 <textarea 
                   className="input min-h-[80px] py-3 text-sm leading-relaxed border-slate-200" 
                   value={form.note}
                   onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                   placeholder="Mention special conditions, origin details, or quality notes..." 
                 />
               </FormField>
            </div>
          </div>

          {/* Submission Summary */}
          {qty > 0 && (
            <div className="bg-emerald-900 text-white rounded-2xl p-5 shadow-lg shadow-emerald-900/10 mb-8 animate-in slide-in-from-bottom-2">
               <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
                  <p className="text-xs font-bold text-emerald-300">Transaction Summary</p>
                  <Info size={14} className="text-emerald-400 opacity-50" />
               </div>
               
               <div className="space-y-2">
                 <div className="flex justify-between text-xs">
                    <span className="text-emerald-100 opacity-70">Subtotal ({qty} {item.measuringUnit} × {price})</span>
                    <span className="font-bold">LKR {(qty * price).toLocaleString()}</span>
                 </div>
                 {discount > 0 && (
                   <div className="flex justify-between text-xs">
                      <span className="text-emerald-100 opacity-70 flex items-center gap-1">Bulk Discount ({discount}%)</span>
                      <span className="font-bold text-emerald-400">− LKR {(qty * price * discount / 100).toLocaleString()}</span>
                   </div>
                 )}
                 <div className="flex justify-between border-t border-white/10 pt-3 mt-1">
                    <span className="text-sm font-bold text-emerald-300">Net Receivable</span>
                    <span className="text-xl font-black tracking-tight text-white">LKR {totalPrice.toLocaleString()}</span>
                 </div>
               </div>
            </div>
          )}

          <div className="flex gap-4 mt-auto">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all flex-1"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving || !form.quantitySent} 
              className="px-8 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex-[2] flex items-center justify-center gap-2"
            >
              {saving ? <Spinner size="sm" /> : <Send size={16} />}
              Send for Approval
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}