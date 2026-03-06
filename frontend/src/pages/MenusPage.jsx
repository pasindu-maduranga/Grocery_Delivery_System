import { useState, useEffect } from 'react'
import { modulesAPI } from '../api/index.js'
import { Modal, ConfirmModal, Table, Badge, FormField, PageLoader, Spinner } from '../components/common/index.jsx'
import IconPicker, { getIcon } from '../components/common/IconPicker.jsx'
import { Plus, Pencil, Power } from 'lucide-react'
import Layout from '../components/layout/Layout.jsx'
import React from 'react'

const EMPTY = { name: '', code: '', parentMenuId: '', icon: 'file-text', order: 1 }

export default function MenusPage() {
  const [items, setItems] = useState([])
  const [parentMenus, setParentMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, mode: 'create', item: null })
  const [confirm, setConfirm] = useState({ open: false, item: null })
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filterParent, setFilterParent] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [m, pm] = await Promise.all([modulesAPI.getMenus(), modulesAPI.getParentMenus()])
      setItems(m.data.data); setParentMenus(pm.data.data)
    } finally { setLoading(false) }
  }

  const openCreate = () => { setForm(EMPTY); setError(''); setModal({ open: true, mode: 'create', item: null }) }
  const openEdit = (item) => {
    setForm({ name: item.name, code: item.code, parentMenuId: item.parentMenu?._id || '', icon: item.icon || 'file-text', order: item.order })
    setError(''); setModal({ open: true, mode: 'edit', item })
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      modal.mode === 'create'
        ? await modulesAPI.createMenu(form)
        : await modulesAPI.updateMenu(modal.item._id, form)
      setModal({ open: false }); load()
    } catch (err) { setError(err.response?.data?.message || 'Something went wrong') }
    finally { setSaving(false) }
  }

  const handleToggle = async () => {
    setSaving(true)
    try { await modulesAPI.toggleMenu(confirm.item._id); setConfirm({ open: false }); load() }
    finally { setSaving(false) }
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const filtered = filterParent ? items.filter(i => i.parentMenu?._id === filterParent) : items

  if (loading) return <Layout title="Menus"><PageLoader /></Layout>

  return (
    <Layout title="Menus" subtitle="Administration → Module Management">
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-semibold text-slate-800">Menus</h3>
            <p className="text-xs text-slate-400 mt-0.5">Groups within sidebar sections — {items.length} total</p>
          </div>
          <div className="flex items-center gap-3">
            <select className="input w-48 text-sm" value={filterParent} onChange={e => setFilterParent(e.target.value)}>
              <option value="">All Sections</option>
              {parentMenus.map(pm => <option key={pm._id} value={pm._id}>{pm.name}</option>)}
            </select>
            <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Menu</button>
          </div>
        </div>

        <Table headers={['Order', 'Icon', 'Menu Name', 'Code', 'Parent Section', 'Status', 'Actions']} empty={filtered.length === 0}>
          {filtered.map(item => {
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
                <td className="table-cell">
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                    {item.parentMenu?.name || '—'}
                  </span>
                </td>
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

      <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'create' ? 'Add Menu' : 'Edit Menu'}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
          <FormField label="Parent Section">
            <select className="input" value={form.parentMenuId} onChange={e => set('parentMenuId', e.target.value)} required>
              <option value="">— Select Parent Menu —</option>
              {parentMenus.filter(p => p.isActive).map(pm => <option key={pm._id} value={pm._id}>{pm.name}</option>)}
            </select>
          </FormField>
          <FormField label="Menu Name">
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Suppliers" />
          </FormField>
          <FormField label="Code">
            <input className="input font-mono" value={form.code}
              onChange={e => set('code', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
              required placeholder="e.g. SUPPLIERS" disabled={modal.mode === 'edit'} />
            <p className="text-xs text-slate-400 mt-1">Uppercase + underscores only. Cannot change after creation.</p>
          </FormField>
          <FormField label="Icon">
            <IconPicker value={form.icon} onChange={v => set('icon', v)} />
          </FormField>
          <FormField label="Order">
            <input type="number" className="input" value={form.order} onChange={e => set('order', +e.target.value)} required min={1} />
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
        message={confirm.item?.isActive ? 'Screens under this menu will be hidden.' : 'Menu becomes visible again.'} />
    </Layout>
  )
}