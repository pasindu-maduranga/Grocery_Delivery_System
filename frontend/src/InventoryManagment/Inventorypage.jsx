import { useState, useEffect } from 'react'
import { inventoryAPI, suppliersAPI } from '../api/index'
import Layout from '../components/layout/Layout'
import { PageLoader, Spinner, Modal, FormField, ConfirmModal } from '../components/common/index'
import { Package, Settings, AlertTriangle, TrendingDown, ImageOff, Bell } from 'lucide-react'
import React from 'react'

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

export default function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [levelsModal, setLevelsModal] = useState({ open: false, item: null })
  const [levelsForm, setLevelsForm] = useState({ minLevel: 0, maxLevel: 0, reorderLevel: 0, preferredSupplier: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [alertConfirm, setAlertConfirm] = useState({ open: false, item: null })
  const [sendingAlert, setSendingAlert] = useState(false)
  const [alertMsg, setAlertMsg] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [inv, sup] = await Promise.all([
        inventoryAPI.getAll(),
        suppliersAPI.getAll({ status: 'approved' }),
      ])
      setInventory(inv.data.data)
      setSuppliers(sup.data.data)
    } finally { setLoading(false) }
  }

  const openLevels = (item) => {
    setLevelsForm({
      minLevel: item.minLevel || 0,
      maxLevel: item.maxLevel || 0,
      reorderLevel: item.reorderLevel || 0,
      preferredSupplier: item.preferredSupplier?._id || '',
    })
    setError('')
    setLevelsModal({ open: true, item })
  }

  const handleSaveLevels = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await inventoryAPI.updateLevels(levelsModal.item._id, levelsForm)
      setLevelsModal({ open: false, item: null })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed')
    } finally { setSaving(false) }
  }

  const handleSendAlert = async () => {
    setSendingAlert(true)
    try {
      const res = await inventoryAPI.sendReorderAlert(alertConfirm.item._id)
      setAlertMsg(res.data.message)
      setAlertConfirm({ open: false, item: null })
      load()
    } catch (err) {
      setAlertMsg(err.response?.data?.message || 'Failed to send alert')
    } finally { setSendingAlert(false) }
  }

  const getStockStatus = (item) => {
    if (item.reorderLevel > 0 && item.totalQuantity <= item.reorderLevel) return 'critical'
    if (item.minLevel > 0 && item.totalQuantity <= item.minLevel) return 'low'
    if (item.maxLevel > 0 && item.totalQuantity >= item.maxLevel) return 'full'
    return 'normal'
  }

  const stockStatusStyle = {
    critical: { bar: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    low:      { bar: 'bg-amber-400', text: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    full:     { bar: 'bg-blue-400', text: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    normal:   { bar: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-white border-slate-200' },
  }

  const getStockPercent = (item) => {
    if (!item.maxLevel) return Math.min((item.totalQuantity / Math.max(item.totalQuantity, 1)) * 100, 100)
    return Math.min((item.totalQuantity / item.maxLevel) * 100, 100)
  }

  if (loading) return <Layout title="Inventory"><PageLoader /></Layout>

  const lowStockCount = inventory.filter(i => getStockStatus(i) === 'critical' || getStockStatus(i) === 'low').length

  return (
    <Layout title="Inventory" subtitle="Manage stock levels and reorder alerts">
      {alertMsg && (
        <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center justify-between">
          <span>{alertMsg}</span>
          <button onClick={() => setAlertMsg('')} className="text-emerald-500 hover:text-emerald-700 font-bold ml-4">✕</button>
        </div>
      )}

      {lowStockCount > 0 && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700 font-medium">{lowStockCount} item{lowStockCount > 1 ? 's' : ''} at or below reorder level</span>
        </div>
      )}

      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Stock Inventory</h3>
          <p className="text-xs text-slate-400 mt-0.5">{inventory.length} items in inventory</p>
        </div>

        {inventory.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
            <Package size={48} className="text-slate-200" />
            <p className="text-sm font-medium">No inventory items yet</p>
            <p className="text-xs">Accepting supplier submissions will add items here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
            {inventory.map(item => {
              const status = getStockStatus(item)
              const style = stockStatusStyle[status]
              const pct = getStockPercent(item)
              const gi = item.groceryItem
              return (
                <div key={item._id} className={`rounded-2xl border p-4 ${style.bg} transition-shadow hover:shadow-md`}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 flex-shrink-0 flex items-center justify-center">
                      {gi?.image
                        ? <img src={gi.image} alt={gi.name} className="w-full h-full object-cover" />
                        : <ImageOff size={18} className="text-slate-300" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm truncate">{gi?.name}</div>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${TYPE_COLORS[gi?.groceryType] || 'bg-slate-100 text-slate-600'}`}>
                        {gi?.groceryType}
                      </span>
                    </div>
                    {(status === 'critical' || status === 'low') && (
                      <AlertTriangle size={16} className={style.text} />
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-xs text-slate-500">Stock Level</span>
                      <span className={`text-sm font-bold ${style.text}`}>
                        {item.totalQuantity} <span className="text-xs font-normal text-slate-400">{item.measuringUnit}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-white/60 rounded-full overflow-hidden border border-white">
                      <div className={`h-full rounded-full transition-all duration-500 ${style.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-1.5 flex justify-between text-xs text-slate-400">
                      <span>Min: {item.minLevel}</span>
                      <span className="font-medium text-slate-600">Reorder: {item.reorderLevel}</span>
                      <span>Max: {item.maxLevel}</span>
                    </div>
                  </div>

                  {item.preferredSupplier && (
                    <div className="mt-2 text-xs text-slate-500 truncate">
                      Supplier: <span className="font-medium text-slate-700">{item.preferredSupplier.businessName}</span>
                    </div>
                  )}

                  <div className="mt-3 flex gap-2 border-t border-white/60 pt-3">
                    <button onClick={() => openLevels(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg transition-colors">
                      <Settings size={12} /> Set Levels
                    </button>
                    {item.reorderLevel > 0 && item.totalQuantity <= item.reorderLevel && (
                      <button onClick={() => setAlertConfirm({ open: true, item })}
                        className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${item.alertSent ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                        disabled={item.alertSent}>
                        <Bell size={12} /> {item.alertSent ? 'Alert Sent' : 'Alert Supplier'}
                      </button>
                    )}
                  </div>

                  {item.lastRestockedAt && (
                    <div className="mt-1.5 text-xs text-slate-400">
                      Last restocked: {new Date(item.lastRestockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal open={levelsModal.open} onClose={() => setLevelsModal({ open: false, item: null })}
        title={`Set Stock Levels — ${levelsModal.item?.groceryItem?.name}`} size="sm">
        <form onSubmit={handleSaveLevels} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Min Level">
              <input className="input" type="number" min="0" value={levelsForm.minLevel}
                onChange={e => setLevelsForm(p => ({ ...p, minLevel: e.target.value }))} />
            </FormField>
            <FormField label="Reorder Level">
              <input className="input" type="number" min="0" value={levelsForm.reorderLevel}
                onChange={e => setLevelsForm(p => ({ ...p, reorderLevel: e.target.value }))} />
            </FormField>
            <FormField label="Max Level">
              <input className="input" type="number" min="0" value={levelsForm.maxLevel}
                onChange={e => setLevelsForm(p => ({ ...p, maxLevel: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Preferred Supplier (for reorder alerts)">
            <select className="input" value={levelsForm.preferredSupplier}
              onChange={e => setLevelsForm(p => ({ ...p, preferredSupplier: e.target.value }))}>
              <option value="">— Select Supplier —</option>
              {suppliers.map(s => <option key={s._id} value={s._id}>{s.businessName}</option>)}
            </select>
          </FormField>
          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
            When stock reaches <strong>Reorder Level</strong>, admin is alerted and can notify the preferred supplier.
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setLevelsModal({ open: false, item: null })} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Spinner size="sm" />} Save Levels
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={alertConfirm.open}
        onClose={() => setAlertConfirm({ open: false, item: null })}
        onConfirm={handleSendAlert}
        loading={sendingAlert}
        title={`Send Reorder Alert for "${alertConfirm.item?.groceryItem?.name}"?`}
        message={`Stock is at ${alertConfirm.item?.totalQuantity} ${alertConfirm.item?.measuringUnit} which has reached the reorder level of ${alertConfirm.item?.reorderLevel}. This will notify ${alertConfirm.item?.preferredSupplier?.businessName || 'the preferred supplier'} to restock.`}
      />
    </Layout>
  )
}