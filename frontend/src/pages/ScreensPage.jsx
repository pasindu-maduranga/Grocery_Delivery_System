import { useState, useEffect } from 'react'
import { modulesAPI } from '../api/index.js'
import { Modal, ConfirmModal, Table, Badge, FormField, PageLoader, Spinner } from '../components/common/index.jsx'
import { Plus, Pencil, Power, Info } from 'lucide-react'
import Layout from '../components/layout/Layout.jsx'
import React from 'react'

const EMPTY = { name: '', code: '', menuId: '', route: '', description: '', order: 1 }

export default function ScreensPage() {
  const [items, setItems] = useState([])
  const [menus, setMenus] = useState([])
  const [parentMenus, setParentMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, mode: 'create', item: null })
  const [confirm, setConfirm] = useState({ open: false, item: null })
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filterParent, setFilterParent] = useState('')
  const [filterMenu, setFilterMenu] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [s, m, pm] = await Promise.all([modulesAPI.getScreens(), modulesAPI.getMenus(), modulesAPI.getParentMenus()])
      setItems(s.data.data); setMenus(m.data.data); setParentMenus(pm.data.data)
    } finally { setLoading(false) }
  }

  const openCreate = () => { setForm(EMPTY); setError(''); setModal({ open: true, mode: 'create', item: null }) }
  const openEdit = (item) => {
    setForm({ name: item.name, code: item.code, menuId: item.menu?._id || '', route: item.route, description: item.description || '', order: item.order })
    setError(''); setModal({ open: true, mode: 'edit', item })
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      modal.mode === 'create'
        ? await modulesAPI.createScreen(form)
        : await modulesAPI.updateScreen(modal.item._id, form)
      setModal({ open: false }); load()
    } catch (err) { setError(err.response?.data?.message || 'Something went wrong') }
    finally { setSaving(false) }
  }

  const handleToggle = async () => {
    setSaving(true)
    try { await modulesAPI.toggleScreen(confirm.item._id); setConfirm({ open: false }); load() }
    finally { setSaving(false) }
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const filteredMenusForBar = filterParent ? menus.filter(m => m.parentMenu?._id === filterParent) : menus
  const filteredItems = items.filter(i => {
    if (filterParent && i.menu?.parentMenu?._id !== filterParent) return false
    if (filterMenu && i.menu?._id !== filterMenu) return false
    return true
  })

  // Group menus by parent for optgroup in form
  const activeMenusByParent = parentMenus.map(pm => ({
    ...pm,
    children: menus.filter(m => m.parentMenu?._id === pm._id && m.isActive)
  })).filter(pm => pm.children.length > 0)

  if (loading) return <Layout title="Screens"><PageLoader /></Layout>

  return (
    <Layout title="Screens" subtitle="Administration → Module Management">

      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-5">
        <Info size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-emerald-800">
          <strong>Workflow:</strong> Add screen here → create <code className="bg-emerald-100 px-1 rounded">src/pages/YourPage.jsx</code> → add route in <code className="bg-emerald-100 px-1 rounded">App.jsx</code> → assign permissions via Roles.
        </p>
      </div>

      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-semibold text-slate-800">Screens</h3>
            <p className="text-xs text-slate-400 mt-0.5">Pages mapped to frontend routes — {items.length} total</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select className="input w-44 text-sm" value={filterParent} onChange={e => { setFilterParent(e.target.value); setFilterMenu('') }}>
              <option value="">All Sections</option>
              {parentMenus.map(pm => <option key={pm._id} value={pm._id}>{pm.name}</option>)}
            </select>
            <select className="input w-44 text-sm" value={filterMenu} onChange={e => setFilterMenu(e.target.value)}>
              <option value="">All Menus</option>
              {filteredMenusForBar.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
            <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Screen</button>
          </div>
        </div>

        <Table
          headers={['#', 'Screen Name', 'Screen Code', 'Frontend Route', 'Menu', 'Section', 'Status', 'Actions']}
          empty={filteredItems.length === 0}
        >
          {filteredItems.map(item => (
            <tr key={item._id} className="hover:bg-slate-50 transition-colors">
              <td className="table-cell">
                <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">{item.order}</span>
              </td>
              <td className="table-cell font-semibold text-slate-800">{item.name}</td>
              <td className="table-cell">
                <code className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-md">{item.code}</code>
              </td>
              <td className="table-cell">
                <code className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{item.route}</code>
              </td>
              <td className="table-cell text-sm text-slate-600">{item.menu?.name || '—'}</td>
              <td className="table-cell">
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  {item.menu?.parentMenu?.name || '—'}
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
          ))}
        </Table>
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'create' ? 'Add New Screen' : 'Edit Screen'}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}

          <FormField label="Menu">
            <select className="input" value={form.menuId} onChange={e => set('menuId', e.target.value)} required>
              <option value="">— Select Menu —</option>
              {activeMenusByParent.map(pm => (
                <optgroup key={pm._id} label={pm.name}>
                  {pm.children.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                </optgroup>
              ))}
            </select>
          </FormField>

          <FormField label="Screen Name">
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. All Suppliers" />
          </FormField>

          <FormField label="Screen Code">
            <input className="input font-mono" value={form.code}
              onChange={e => set('code', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
              required placeholder="e.g. SCREEN_SUPPLIERS" disabled={modal.mode === 'edit'} />
            <p className="text-xs text-slate-400 mt-1">Convention: <code>SCREEN_</code> prefix. Used in backend middleware + PermissionRoute.</p>
          </FormField>

          <FormField label="Frontend Route">
            <input className="input font-mono" value={form.route} onChange={e => set('route', e.target.value)} required placeholder="e.g. /suppliers" />
            <p className="text-xs text-slate-400 mt-1">Must exactly match the path in <code>App.jsx</code>.</p>
          </FormField>

          <FormField label="Description (optional)">
            <input className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description of this screen" />
          </FormField>

          <FormField label="Order">
            <input type="number" className="input" value={form.order} onChange={e => set('order', +e.target.value)} required min={1} />
          </FormField>

          {/* Reminder box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-amber-700 mb-1">After saving, remember to:</p>
            <ol className="text-xs text-amber-600 space-y-0.5 list-decimal list-inside">
              <li>Create <code className="bg-amber-100 px-1 rounded">src/pages/YourPage.jsx</code></li>
              <li>Add route in <code className="bg-amber-100 px-1 rounded">App.jsx</code> with <code className="bg-amber-100 px-1 rounded">screenCode="{form.code || 'SCREEN_...'}"</code></li>
              <li>Go to <strong>Roles → Permissions</strong> and enable for the right role</li>
            </ol>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setModal({ open: false })} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Spinner size="sm" />}{modal.mode === 'create' ? 'Create Screen' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={confirm.open} onClose={() => setConfirm({ open: false })} onConfirm={handleToggle} loading={saving}
        title={`${confirm.item?.isActive ? 'Deactivate' : 'Activate'} "${confirm.item?.name}"?`}
        message={confirm.item?.isActive ? 'Hidden from all sidebars and permission panels.' : 'Becomes available again.'} />
    </Layout>
  )
}