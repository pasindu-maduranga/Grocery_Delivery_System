import { useState, useEffect } from 'react'
import { rolesAPI } from '../api/index'
import { Modal, ConfirmModal, Table, Badge, FormField, PageLoader, Spinner } from '../components/common/index.jsx'
import { Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react'
import Layout from '../components/layout/Layout'
import PermissionPanel from '../components/roles/PermissionPanel.jsx'
import React from 'react'

const EMPTY_FORM = { name: '', description: '' }

export default function RolesPage() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, mode: 'create', role: null })
  const [permModal, setPermModal] = useState({ open: false, role: null })
  const [confirmModal, setConfirmModal] = useState({ open: false, role: null })
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchRoles() }, [])

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const res = await rolesAPI.getAll()
      setRoles(res.data.data)
    } finally { setLoading(false) }
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setError('')
    setModal({ open: true, mode: 'create', role: null })
  }

  const openEdit = (role) => {
    setForm({ name: role.name, description: role.description || '' })
    setError('')
    setModal({ open: true, mode: 'edit', role })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (modal.mode === 'create') await rolesAPI.create(form)
      else await rolesAPI.update(modal.role._id, form)
      setModal({ open: false })
      fetchRoles()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await rolesAPI.delete(confirmModal.role._id)
      setConfirmModal({ open: false })
      fetchRoles()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete')
    } finally { setSaving(false) }
  }

  if (loading) return <Layout title="Roles"><PageLoader /></Layout>

  return (
    <Layout title="Roles" subtitle="Administration → User Management">
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Roles</h3>
            <p className="text-xs text-slate-400 mt-0.5">{roles.length} roles configured</p>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Add Role
          </button>
        </div>

        <Table
          headers={['Role Name', 'Description', 'Status', 'Created', 'Actions']}
          empty={roles.length === 0}
        >
          {roles.map(role => (
            <tr key={role._id} className="hover:bg-slate-50 transition-colors">
              <td className="table-cell font-medium text-slate-800">{role.name}</td>
              <td className="table-cell text-slate-500 max-w-xs truncate">{role.description || '—'}</td>
              <td className="table-cell">
                <Badge type={role.isActive ? 'active' : 'inactive'} label={role.isActive ? 'Active' : 'Inactive'} />
              </td>
              <td className="table-cell text-xs text-slate-400">
                {new Date(role.createdAt).toLocaleDateString()}
              </td>
              <td className="table-cell">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPermModal({ open: true, role })}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-primary-50 text-primary-600 text-xs font-medium transition-colors"
                    title="Change Permissions"
                  >
                    <ShieldCheck size={14} /> Permissions
                  </button>
                  <button onClick={() => openEdit(role)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setConfirmModal({ open: true, role })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.mode === 'create' ? 'Create Role' : 'Edit Role'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <FormField label="Role Name">
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Inventory Manager" />
          </FormField>
          <FormField label="Description">
            <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description of this role..." />
          </FormField>
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setModal({ open: false })} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Spinner size="sm" />}
              {modal.mode === 'create' ? 'Create Role' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Permission Panel Modal */}
      <Modal
        open={permModal.open}
        onClose={() => setPermModal({ open: false })}
        title={`Permissions — ${permModal.role?.name}`}
        size="xl"
      >
        {permModal.role && (
          <PermissionPanel
            role={permModal.role}
            onClose={() => setPermModal({ open: false })}
          />
        )}
      </Modal>

      <ConfirmModal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false })}
        onConfirm={handleDelete}
        loading={saving}
        title={`Delete "${confirmModal.role?.name}"?`}
        message="This role will be deactivated. Users assigned to it will lose access."
      />
    </Layout>
  )
}