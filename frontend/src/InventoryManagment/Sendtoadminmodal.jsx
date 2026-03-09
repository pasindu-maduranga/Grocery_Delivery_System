import { useState } from 'react'
import { grocerySubmissionsAPI } from '../../api/index'
import { Modal, FormField, Spinner } from '../common/index'
import { Send, ImageOff, Tag } from 'lucide-react'
import React from 'react'

export default function SendToAdminModal({ item, onClose, onSent }) {
  const [form, setForm] = useState({
    quantitySent: '',
    unitPrice: item.unitPrice,
    discountPercent: 0,
    note: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const qty = Number(form.quantitySent) || 0
  const price = Number(form.unitPrice) || 0
  const discount = Number(form.discountPercent) || 0
  const discountedPrice = price * (1 - discount / 100)
  const totalPrice = qty * discountedPrice

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await grocerySubmissionsAPI.send({
        groceryItemId: item._id,
        quantitySent: qty,
        unitPrice: price,
        discountPercent: discount,
        note: form.note,
      })
      onSent()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send')
    } finally { setSaving(false) }
  }

  return (
    <Modal open={true} onClose={onClose} title="Send Grocery Item to Admin" size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
            {item.image
              ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              : <ImageOff size={20} className="text-slate-300" />
            }
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-800">{item.name}</div>
            <div className="text-xs text-slate-500 mt-0.5">{item.groceryType}</div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5">
              Available: {item.availableQuantity} {item.measuringUnit}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label={`Quantity to Send (max ${item.availableQuantity} ${item.measuringUnit})`} className="col-span-2">
            <input className="input" type="number" min="1" max={item.availableQuantity} step="0.01"
              value={form.quantitySent} onChange={e => setForm(p => ({ ...p, quantitySent: e.target.value }))}
              required placeholder={`Max ${item.availableQuantity}`} />
          </FormField>
          <FormField label="Unit Price ($)">
            <input className="input" type="number" min="0" step="0.01"
              value={form.unitPrice} onChange={e => setForm(p => ({ ...p, unitPrice: e.target.value }))} required />
          </FormField>
          <FormField label="Discount (%)">
            <input className="input" type="number" min="0" max="100" step="0.1"
              value={form.discountPercent} onChange={e => setForm(p => ({ ...p, discountPercent: e.target.value }))} />
          </FormField>
        </div>

        {qty > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1.5">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Quantity × Unit Price</span>
              <span>{qty} × ${price.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span className="flex items-center gap-1"><Tag size={12} /> Discount ({discount}%)</span>
                <span>−${(qty * price * discount / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-slate-800 border-t border-emerald-200 pt-1.5">
              <span>Total Price</span>
              <span className="text-emerald-700">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}

        <FormField label="Note to Admin (optional)">
          <textarea className="input h-20 resize-none" value={form.note}
            onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
            placeholder="Any special notes or conditions..." />
        </FormField>

        <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving || !form.quantitySent} className="btn-primary">
            {saving && <Spinner size="sm" />}
            <Send size={14} /> Send to Admin
          </button>
        </div>
      </form>
    </Modal>
  )
}