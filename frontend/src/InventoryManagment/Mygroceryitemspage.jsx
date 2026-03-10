import { useState, useEffect } from 'react'
import { groceryItemsAPI } from '../api/index'
import Layout from '../components/layout/Layout'
import { Table, Badge, PageLoader, Spinner, Modal, FormField, ConfirmModal } from '../components/common/index'
import { Plus, Pencil, Trash2, Send, Package, ImageOff } from 'lucide-react'
import React from 'react'
import SendToAdminModal from '../InventoryManagment/Sendtoadminmodal'

const GROCERY_TYPES = [
  'Produce', 'Dairy', 'Meat & Seafood', 'Bakery',
  'Pantry / Dry Goods', 'Beverages', 'Frozen Foods',
  'Snacks', 'Herbs & Spices', 'Household & Cleaning',
  'Health & Personal Care', 'Baby & Kids'
]

const TYPE_COLORS = {
  'Produce': 'bg-green-100 text-green-700',
  'Dairy': 'bg-blue-100 text-blue-700',
  'Meat & Seafood': 'bg-red-100 text-red-700',
  'Bakery': 'bg-amber-100 text-amber-700',
  'Pantry / Dry Goods': 'bg-stone-100 text-stone-700',
  'Beverages': 'bg-cyan-100 text-cyan-700',
  'Frozen Foods': 'bg-indigo-100 text-indigo-700',
  'Snacks': 'bg-orange-100 text-orange-700',
  'Herbs & Spices': 'bg-lime-100 text-lime-700',
  'Household & Cleaning': 'bg-purple-100 text-purple-700',
  'Health & Personal Care': 'bg-pink-100 text-pink-700',
  'Baby & Kids': 'bg-rose-100 text-rose-700',
}

const emptyForm = { name: '', groceryType: '', availableQuantity: '', measuringUnit: '', unitPrice: '', description: '', image: null }

export default function MyGroceryItemsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, item: null })
  const [form, setForm] = useState(emptyForm)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, item: null })
  const [deleting, setDeleting] = useState(false)
  const [sendModal, setSendModal] = useState({ open: false, item: null })

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await groceryItemsAPI.getMy()
      setItems(res.data.data)
    } finally { setLoading(false) }
  }

  const openAdd = () => {
    setForm(emptyForm)
    setImagePreview(null)
    setError('')
    setModal({ open: true, item: null })
  }

  const openEdit = (item) => {
    setForm({
      name: item.name,
      groceryType: item.groceryType,
      availableQuantity: item.availableQuantity,
      measuringUnit: item.measuringUnit,
      unitPrice: item.unitPrice,
      description: item.description || '',
      image: null,
    })
    setImagePreview(item.image || null)
    setError('')
    setModal({ open: true, item })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm(p => ({ ...p, image: file }))
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v) })
      if (modal.item) {
        await groceryItemsAPI.update(modal.item._id, fd)
      } else {
        await groceryItemsAPI.create(fd)
      }
      setModal({ open: false, item: null })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await groceryItemsAPI.delete(deleteConfirm.item._id)
      setDeleteConfirm({ open: false, item: null })
      load()
    } finally { setDeleting(false) }
  }

  if (loading) return <Layout title="My Grocery Items"><PageLoader /></Layout>

  return (
    <Layout title="My Grocery Items" subtitle="Manage your grocery inventory">
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-semibold text-slate-800">Grocery Items</h3>
            <p className="text-xs text-slate-400 mt-0.5">{items.length} items listed</p>
          </div>
          <button onClick={openAdd} className="btn-primary">
            <Plus size={16} /> Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
            <Package size={48} className="text-slate-200" />
            <p className="text-sm font-medium">No grocery items yet</p>
            <p className="text-xs">Add your first item to start sending to admin</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
            {items.map(item => (
              <div key={item._id} className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-white">
                <div className="h-40 bg-slate-50 flex items-center justify-center relative overflow-hidden">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <ImageOff size={36} className="text-slate-300" />
                  }
                  <div className="absolute top-2 left-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[item.groceryType] || 'bg-slate-100 text-slate-600'}`}>
                      {item.groceryType}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-slate-800 text-sm truncate">{item.name}</h4>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-emerald-600 text-sm">${item.unitPrice}/{item.measuringUnit}</span>
                    <span className={`font-medium ${item.availableQuantity <= 10 ? 'text-red-500' : 'text-slate-600'}`}>
                      {item.availableQuantity} {item.measuringUnit} avail.
                    </span>
                  </div>
                  {item.description && (
                    <p className="mt-1.5 text-xs text-slate-400 line-clamp-2">{item.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-3">
                    <button onClick={() => setSendModal({ open: true, item })} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
                      <Send size={12} /> Send to Admin
                    </button>
                    <button onClick={() => openEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setDeleteConfirm({ open: true, item })} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, item: null })}
        title={modal.item ? 'Edit Grocery Item' : 'Add Grocery Item'} size="md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 flex-shrink-0">
              {imagePreview
                ? <img src={imagePreview} alt="" className="w-full h-full object-cover rounded-xl" />
                : <ImageOff size={24} className="text-slate-300" />
              }
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Item Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Item Name" className="col-span-2">
              <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Fresh Tomatoes" />
            </FormField>
            <FormField label="Grocery Type">
              <select className="input" value={form.groceryType} onChange={e => setForm(p => ({ ...p, groceryType: e.target.value }))} required>
                <option value="">— Select Type —</option>
                {GROCERY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Measuring Unit">
              <input className="input" value={form.measuringUnit} onChange={e => setForm(p => ({ ...p, measuringUnit: e.target.value }))} required placeholder="kg, litre, piece..." />
            </FormField>
            <FormField label="Available Quantity">
              <input className="input" type="number" min="0" step="0.01" value={form.availableQuantity}
                onChange={e => setForm(p => ({ ...p, availableQuantity: e.target.value }))} required />
            </FormField>
            <FormField label="Unit Price ($)">
              <input className="input" type="number" min="0" step="0.01" value={form.unitPrice}
                onChange={e => setForm(p => ({ ...p, unitPrice: e.target.value }))} required />
            </FormField>
          </div>

          <FormField label="Description (optional)">
            <textarea className="input h-20 resize-none" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Brief description of the item..." />
          </FormField>

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setModal({ open: false, item: null })} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Spinner size="sm" />} {modal.item ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, item: null })}
        onConfirm={handleDelete} loading={deleting}
        title={`Delete "${deleteConfirm.item?.name}"?`}
        message="This item will be permanently deleted. This cannot be undone."
      />

      {sendModal.open && (
        <SendToAdminModal
          item={sendModal.item}
          onClose={() => setSendModal({ open: false, item: null })}
          onSent={() => { setSendModal({ open: false, item: null }); load() }}
        />
      )}
    </Layout>
  )
}