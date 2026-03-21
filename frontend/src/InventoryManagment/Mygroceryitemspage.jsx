import { useState, useEffect } from 'react'
import { groceryItemsAPI } from '../api/index'
import Layout from '../components/layout/Layout'
import { Modal, FormField, Spinner, EmptyState } from '../components/common/index'
import { 
  Plus, Pencil, Trash2, Send, Package, ImageOff, 
  Search, Filter, IndianRupee, Layers, 
  ChevronRight, Info, AlertCircle, CheckCircle2,
  Image as ImageIcon
} from 'lucide-react'
import React from 'react'
import SendToAdminModal from '../InventoryManagment/Sendtoadminmodal'
import { Toaster, toast } from 'sonner'

const GROCERY_TYPES = [
  'Produce', 'Dairy', 'Meat & Seafood', 'Bakery',
  'Pantry / Dry Goods', 'Beverages', 'Frozen Foods',
  'Snacks', 'Herbs & Spices', 'Household & Cleaning',
  'Health & Personal Care', 'Baby & Kids'
]

const emptyForm = { 
  name: '', groceryType: '', availableQuantity: '', 
  measuringUnit: 'kg', unitPrice: '', description: '', image: null 
}

export default function MyGroceryItemsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  
  const [modal, setModal] = useState({ open: false, item: null })
  const [form, setForm] = useState(emptyForm)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, item: null })
  const [deleting, setDeleting] = useState(false)
  const [sendModal, setSendModal] = useState({ open: false, item: null })

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await groceryItemsAPI.getMy()
      setItems(res.data.data)
    } catch (err) {
      toast.error('Failed to load items')
    } finally { setLoading(false) }
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.groceryType) e.groceryType = 'Category is required'
    if (!form.unitPrice || form.unitPrice <= 0) e.unitPrice = 'Valid price required'
    if (!form.availableQuantity || form.availableQuantity < 0) e.availableQuantity = 'Valid quantity required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2MB')
    
    setForm(p => ({ ...p, image: file }))
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v)
      })

      if (modal.item) {
        await groceryItemsAPI.update(modal.item._id, fd)
        toast.success('Item updated successfully')
      } else {
        await groceryItemsAPI.create(fd)
        toast.success('New item added to catalog')
      }
      
      setModal({ open: false, item: null })
      setForm(emptyForm)
      setImagePreview(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save item')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await groceryItemsAPI.delete(deleteConfirm.item._id)
      toast.success('Item removed from catalog')
      setDeleteConfirm({ open: false, item: null })
      load()
    } catch (err) {
      toast.error('Could not delete item')
    } finally { setDeleting(false) }
  }

  const filteredItems = items.filter(it => {
    const matchesSearch = it.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = activeFilter === 'All' || it.groceryType === activeFilter
    return matchesSearch && matchesFilter
  })

  return (
    <Layout title="My Catalog" subtitle="Manage and supply your grocery items">
      <Toaster position="top-right" richColors />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        
        {/* Analytics Header / Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card border-none bg-emerald-900 text-white overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Package size={80} />
            </div>
            <div className="relative z-10">
              <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest mb-1">Total Items</p>
              <h3 className="text-3xl font-black">{items.length}</h3>
              <p className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1 font-medium italic">
                <CheckCircle2 size={12} /> Active in catalog
              </p>
            </div>
          </div>

          <div className="stat-card border-none bg-white shadow-sm ring-1 ring-slate-100">
            <p className="label text-slate-400">Total Value</p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold text-slate-800">
                {items.reduce((acc, it) => acc + (it.unitPrice * it.availableQuantity), 0).toLocaleString()}
              </h3>
              <span className="text-xs font-bold text-emerald-600 pb-1">LKR</span>
            </div>
            <div className="w-full bg-slate-50 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-emerald-500 h-full w-[65%] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
            </div>
          </div>

          <div className="stat-card border-none bg-white shadow-sm ring-1 ring-slate-100">
            <p className="label text-slate-400">Low Stock</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {items.filter(it => it.availableQuantity < 10).length}
            </h3>
            <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1 font-bold">
              <AlertCircle size={12} /> Requires attention
            </p>
          </div>

          <div className="stat-card border-none bg-white shadow-sm ring-1 ring-slate-100 flex flex-col justify-center">
            <button 
              onClick={() => { setForm(emptyForm); setModal({ open: true, item: null }); setImagePreview(null); }}
              className="w-full h-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 group transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
                <Plus size={18} />
              </div>
              <span className="text-sm font-bold text-emerald-700">New Item</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative group w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by product name..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input pl-11 bg-slate-50 border-transparent focus:bg-white h-11"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
             <div className="flex bg-slate-100 p-1 rounded-xl whitespace-nowrap">
                {['All', ...new Set(items.map(it => it.groceryType))].slice(0, 5).map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeFilter === cat ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
             <button className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors">
               <Filter size={18} />
             </button>
          </div>
        </div>

        {/* Grid Display */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
             <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Synchronizing Catalog...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="card py-20 bg-white/50 border-dashed border-2 flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
               <Package size={40} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No products match your criteria</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters.</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
              className="mt-6 text-emerald-600 font-bold text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredItems.map(item => (
              <div 
                key={item._id} 
                className="card group hover:shadow-2xl hover:shadow-emerald-900/5 hover:-translate-y-1.5 transition-all duration-500 overflow-visible bg-white h-full flex flex-col"
              >
                <div className="relative h-52 bg-slate-50 flex-shrink-0 rounded-t-2xl overflow-hidden">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                      <ImageIcon size={48} strokeWidth={1} />
                    </div>
                  )}
                  
                  {/* Category Badge - Professional Style */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-emerald-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-xl">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-tight">{item.groceryType}</p>
                    </div>
                  </div>

                  {/* Edit/Delete Floating Bar */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                     <button 
                        onClick={() => { setForm(emptyForm); setModal({ open: true, item }); setImagePreview(item.image); }}
                        className="w-10 h-10 bg-white shadow-xl rounded-xl flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                     >
                       <Pencil size={16} />
                     </button>
                     <button 
                        onClick={() => setDeleteConfirm({ open: true, item })}
                        className="w-10 h-10 bg-white shadow-xl rounded-xl flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors"
                     >
                       <Trash2 size={16} />
                     </button>
                  </div>

                  {/* Hover Supply Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                    <button 
                      onClick={() => setSendModal({ open: true, item })}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2 group/btn transition-all"
                    >
                      <Send size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                      Supply to Admin
                    </button>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-base font-bold text-slate-800 line-clamp-1 flex-1 leading-tight group-hover:text-emerald-700 transition-colors">
                      {item.name}
                    </h4>
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                      {item.measuringUnit}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed h-8 mb-6">
                    {item.description || "No description available for this catalog item."}
                  </p>

                  <div className="mt-auto grid grid-cols-2 pt-6 border-t border-slate-50 gap-4">
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-300 tracking-widest mb-1">Unit Price</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-bold text-emerald-900 leading-none">LKR</span>
                        <span className="text-xl font-black text-emerald-900 leading-none tracking-tight">{item.unitPrice}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-slate-300 tracking-widest mb-1">Stock</p>
                      <p className={`text-base font-black ${item.availableQuantity < 10 ? 'text-amber-600' : 'text-slate-800'}`}>
                        {item.availableQuantity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modern High-End Modal for Adding/Editing */}
      <Modal 
        open={modal.open} 
        onClose={() => setModal({ open: false, item: null })}
        title={modal.item ? "Update Product Details" : "Register New Product"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row min-h-[500px]">
          {/* Left Preview Section */}
          <div className="w-full md:w-[320px] bg-emerald-950 p-8 flex flex-col gap-6 text-white relative overflow-hidden">
             <div className="absolute top-[-10%] left-[-10%] w-48 h-48 bg-emerald-500/20 rounded-full blur-[80px]"></div>
             
             <div className="relative z-10">
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">Live Preview</h4>
                <div className="aspect-square w-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center group/img relative">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={48} className="text-white/20" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-emerald-900 px-4 py-2 rounded-xl text-xs font-black uppercase hover:scale-105 transition-transform">
                      Change Media
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>
                {form.name && (
                   <div className="mt-4">
                      <p className="text-lg font-bold truncate">{form.name}</p>
                      <p className="text-xs text-emerald-400/80 font-medium">LKR {form.unitPrice || '0.00'}/{form.measuringUnit}</p>
                   </div>
                )}
             </div>

             <div className="mt-auto relative z-10 pt-8 border-t border-white/5">
                <div className="flex items-center gap-3 text-emerald-300">
                   <Info size={16} />
                   <p className="text-[10px] font-bold uppercase leading-tight tracking-wide">
                     Fill all required fields to register the item in the central inventory.
                   </p>
                </div>
             </div>
          </div>

          {/* Right Input Section */}
          <div className="flex-1 p-8 md:p-10 bg-white overflow-y-auto max-h-[600px] no-scrollbar">
             <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                   <FormField label="Product Performance Name" error={errors.name}>
                      <input 
                         className="input h-12 shadow-sm"
                         value={form.name} 
                         onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                         placeholder="e.g. Premium Basmati Rice"
                      />
                   </FormField>
                </div>

                <FormField label="Category" error={errors.groceryType}>
                  <select 
                    className="input h-12 shadow-sm"
                    value={form.groceryType} 
                    onChange={e => setForm(p => ({ ...p, groceryType: e.target.value }))}
                  >
                    <option value="">Select Type</option>
                    {GROCERY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormField>

                <FormField label="Base Unit">
                  <select 
                    className="input h-12 shadow-sm font-bold text-slate-700"
                    value={form.measuringUnit} 
                    onChange={e => setForm(p => ({ ...p, measuringUnit: e.target.value }))}
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="packet">Packet</option>
                    <option value="liter">Liter (L)</option>
                  </select>
                </FormField>

                <FormField label="Unit Price (LKR)" error={errors.unitPrice}>
                  <input 
                    type="number" className="input h-12 shadow-sm font-bold text-emerald-700"
                    value={form.unitPrice} 
                    onChange={e => setForm(p => ({ ...p, unitPrice: e.target.value }))}
                    placeholder="0.00"
                  />
                </FormField>

                <FormField label="Current Stock" error={errors.availableQuantity}>
                  <input 
                    type="number" className="input h-12 shadow-sm"
                    value={form.availableQuantity} 
                    onChange={e => setForm(p => ({ ...p, availableQuantity: e.target.value }))}
                    placeholder="0"
                  />
                </FormField>

                <div className="col-span-2">
                  <FormField label="Description & Notes">
                    <textarea 
                      className="input min-h-[100px] py-4 leading-relaxed"
                      value={form.description} 
                      onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Describe freshness, origin, or variety..."
                    />
                  </FormField>
                </div>
             </div>

             <div className="flex gap-4 pt-10 mt-6 border-t border-slate-50">
                <button 
                  type="button" 
                  onClick={() => setModal({ open: false, item: null })}
                  className="btn-secondary flex-1 h-12 rounded-2xl"
                >
                  Discard
                </button>
                <button 
                  disabled={saving}
                  type="submit" 
                  className="btn-primary flex-1 h-12 rounded-2xl shadow-emerald-900/10"
                >
                  {saving ? <Spinner size="sm" /> : modal.item ? 'Save Changes' : 'Confirm Registration'}
                </button>
             </div>
          </div>
        </form>
      </Modal>

      {/* Enhanced Confirm Delete Modal */}
      <Modal
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, item: null })}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="p-8 text-center">
           <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
             <Trash2 size={28} />
           </div>
           <h3 className="text-lg font-bold text-slate-800">Remove Item?</h3>
           <p className="text-sm text-slate-500 mt-2">
             Are you sure you want to remove <span className="font-bold text-slate-700">"{deleteConfirm.item?.name}"</span>? 
             This action cannot be undone and will remove it from the catalog.
           </p>
           
           <div className="flex flex-col gap-3 mt-8">
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/10 flex items-center justify-center gap-2"
              >
                {deleting && <Spinner size="sm" />} Yes, Delete Item
              </button>
              <button 
                onClick={() => setDeleteConfirm({ open: false, item: null })}
                className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
              >
                Keep Item
              </button>
           </div>
        </div>
      </Modal>

      {/* Supply Interaction Modal */}
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