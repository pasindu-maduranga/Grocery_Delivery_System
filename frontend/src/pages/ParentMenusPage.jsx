import { useState, useEffect } from 'react'
import { modulesAPI } from '../api/index.js'
import { Modal, ConfirmModal, Table, Badge, FormField, PageLoader, Spinner } from '../components/common/index.jsx'
import IconPicker, { getIcon } from '../components/common/IconPicker.jsx'
import { Plus, Pencil, Power } from 'lucide-react'
import Layout from '../components/layout/Layout.jsx'
import React from 'react'

const EMPTY = { name: '', code: '', icon: 'settings', order: 1, isSuperAdminOnly: false }

export default function ParentMenusPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, mode: 'create', item: null })
  const [confirm, setConfirm] = useState({ open: false, item: null })
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try { const r = await modulesAPI.getParentMenus(); setItems(r.data.data) }
    finally { setLoading(false) }
  }

  const openCreate = () => { setForm(EMPTY); setError(''); setModal({ open: true, mode: 'create', item: null }) }
  const openEdit = (item) => {
    setForm({ name: item.name, code: item.code, icon: item.icon || 'settings', order: item.order, isSuperAdminOnly: item.isSuperAdminOnly })
    setError(''); setModal({ open: true, mode: 'edit', item })
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      modal.mode === 'create'
        ? await modulesAPI.createParentMenu(form)
        : await modulesAPI.updateParentMenu(modal.item._id, form)
      setModal({ open: false }); load()
    } catch (err) { setError(err.response?.data?.message || 'Something went wrong') }
    finally { setSaving(false) }
  }

  const handleToggle = async () => {
    setSaving(true)
    try { await modulesAPI.toggleParentMenu(confirm.item._id); setConfirm({ open: false }); load() }
    finally { setSaving(false) }
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  if (loading) return <Layout title="Parent Menus"><PageLoader /></Layout>

  return (
    <Layout title="Parent Menus" subtitle="Administration → Module Management">
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Parent Menus</h3>
            <p className="text-xs text-slate-400 mt-0.5">Top-level sidebar sections — {items.length} total</p>
          </div>
          <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Parent Menu</button>
        </div>

        <Table headers={['Order', 'Icon', 'Name', 'Code', 'Admin Only', 'Status', 'Actions']} empty={items.length === 0}>
          {items.map(item => {
            const Ic = getIcon(item.icon)
            return (
              <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                <td className="table-cell">
                  <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">{item.order}</span>
                </td>
                <td className="table-cell">
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Ic size={17} className="text-emerald-700" />
                  </div>
                </td>
                <td className="table-cell font-semibold text-slate-800">{item.name}</td>
                <td className="table-cell"><code className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{item.code}</code></td>
                <td className="table-cell"><Badge type={item.isSuperAdminOnly ? 'locked' : 'active'} label={item.isSuperAdminOnly ? 'Yes' : 'No'} /></td>
                <td className="table-cell"><Badge type={item.isActive ? 'active' : 'inactive'} label={item.isActive ? 'Active' : 'Inactive'} /></td>
                <td className="table-cell">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500"><Pencil size={14} /></button>
                    <button onClick={() => setConfirm({ open: true, item })} className={`w-8 h-8 flex items-center justify-center rounded-lg ${item.isActive ? 'hover:bg-red-50 text-red-400' : 'hover:bg-emerald-50 text-emerald-500'}`}><Power size={14} /></button>
                  </div>
                </td>
              </tr>
            )
          })}
        </Table>
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'create' ? 'Add Parent Menu' : 'Edit Parent Menu'}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
          <FormField label="Display Name">
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Supplier Management" />
          </FormField>
          <FormField label="Code">
            <input className="input font-mono" value={form.code}
              onChange={e => set('code', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
              required placeholder="e.g. SUPPLIER_MANAGEMENT" disabled={modal.mode === 'edit'} />
            <p className="text-xs text-slate-400 mt-1">Uppercase + underscores only. Cannot change after creation.</p>
          </FormField>
          <FormField label="Icon">
            <IconPicker value={form.icon} onChange={v => set('icon', v)} />
          </FormField>
          <FormField label="Sidebar Order">
            <input type="number" className="input" value={form.order} onChange={e => set('order', +e.target.value)} required min={1} />
          </FormField>
          <FormField label="">
            <label className="flex items-center gap-3 cursor-pointer py-1">
              <input type="checkbox" checked={form.isSuperAdminOnly} onChange={e => set('isSuperAdminOnly', e.target.checked)} className="w-4 h-4 accent-emerald-600" />
              <span className="text-sm text-slate-700">Visible to Super Admin only</span>
            </label>
          </FormField>
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setModal({ open: false })} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Spinner size="sm" />}{modal.mode === 'create' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={confirm.open} onClose={() => setConfirm({ open: false })} onConfirm={handleToggle} loading={saving}
        title={`${confirm.item?.isActive ? 'Deactivate' : 'Activate'} "${confirm.item?.name}"?`}
        message={confirm.item?.isActive ? 'Hides from all sidebars immediately.' : 'Makes it visible again.'} />
    </Layout>
  )
}