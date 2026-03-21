import { useState, useEffect } from 'react'
import { usersAPI, rolesAPI } from '../api/index'
import { Modal, ConfirmModal, Table, Badge, PageHeader, FormField, PageLoader, Spinner } from '../components/common'
import { Plus, Pencil, Lock, Unlock, Power, KeyRound } from 'lucide-react'
import Layout from '../components/layout/Layout'
import React from 'react'

const EMPTY_FORM = { firstName: '', lastName: '', username: '', password: '', roleId: '' }

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, mode: 'create', user: null })
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, user: null })
  const [resetModal, setResetModal] = useState({ open: false, user: null })
  const [form, setForm] = useState(EMPTY_FORM)
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [u, r] = await Promise.all([usersAPI.getAll(), rolesAPI.getAll()])
      setUsers(u.data.data)
      setRoles(r.data.data)
    } finally { setLoading(false) }
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setError('')
    setModal({ open: true, mode: 'create', user: null })
  }

  const openEdit = (user) => {
    setForm({ firstName: user.firstName, lastName: user.lastName, username: user.username, password: '', roleId: user.role?._id || '' })
    setError('')
    setModal({ open: true, mode: 'edit', user })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (modal.mode === 'create') {
        await usersAPI.create(form)
      } else {
        const { password, ...data } = form
        await usersAPI.update(modal.user._id, data)
      }
      setModal({ open: false })
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally { setSaving(false) }
  }

  const handleConfirm = async () => {
    setSaving(true)
    try {
      const { action, user } = confirmModal
      if (action === 'toggle-active') await usersAPI.toggleActive(user._id)
      if (action === 'toggle-lock') await usersAPI.toggleLock(user._id)
      setConfirmModal({ open: false })
      fetchAll()
    } finally { setSaving(false) }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await usersAPI.resetPassword(resetModal.user._id, { newPassword })
      setResetModal({ open: false })
      setNewPassword('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally { setSaving(false) }
  }

  if (loading) return <Layout title="Users"><PageLoader /></Layout>

  return (
    <Layout title="Users" subtitle="Administration → User Management">
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">System Users</h3>
            <p className="text-xs text-slate-400 mt-0.5">{users.length} total users</p>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Add User
          </button>
        </div>

        <Table
          headers={['User', 'Username', 'Role', 'Status', 'Last Login', 'Actions']}
          empty={users.length === 0}
        >
          {users.map(user => (
            <tr key={user._id} className="hover:bg-slate-50 transition-colors">
              <td className="table-cell">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 text-xs font-bold">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{user.firstName} {user.lastName}</div>
                  </div>
                </div>
              </td>
              <td className="table-cell font-mono text-xs text-slate-500">{user.username}</td>
              <td className="table-cell">
                <span className="text-xs bg-primary-50 text-primary-700 border border-primary-200 px-2 py-0.5 rounded-full font-medium">
                  {user.role?.name || '—'}
                </span>
              </td>
              <td className="table-cell">
                {user.isLocked
                  ? <Badge type="locked" label="Locked" />
                  : user.isActive
                  ? <Badge type="active" label="Active" />
                  : <Badge type="inactive" label="Inactive" />
                }
              </td>
              <td className="table-cell text-xs text-slate-400">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
              </td>
              <td className="table-cell">
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(user)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Edit">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setConfirmModal({ open: true, action: 'toggle-lock', user })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                    title={user.isLocked ? 'Unlock' : 'Lock'}
                  >
                    {user.isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                  </button>
                  <button
                    onClick={() => setConfirmModal({ open: true, action: 'toggle-active', user })}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${user.isActive ? 'hover:bg-red-50 text-red-400' : 'hover:bg-emerald-50 text-emerald-500'}`}
                    title={user.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <Power size={14} />
                  </button>
                  <button
                    onClick={() => { setResetModal({ open: true, user }); setNewPassword(''); setError('') }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                    title="Reset Password"
                  >
                    <KeyRound size={14} />
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
        title={modal.mode === 'create' ? 'Add New User' : 'Edit User'}
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name">
              <input className="input" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
            </FormField>
            <FormField label="Last Name">
              <input className="input" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
            </FormField>
          </div>
          <FormField label="Username">
            <input className="input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required disabled={modal.mode === 'edit'} />
          </FormField>
          {modal.mode === 'create' && (
            <FormField label="Password">
              <input type="password" className="input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </FormField>
          )}
          <FormField label="Role">
            <select className="input" value={form.roleId} onChange={e => setForm({ ...form, roleId: e.target.value })} required>
              <option value="">— Select Role —</option>
              {roles.filter(r => r.isActive).map(r => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </FormField>
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setModal({ open: false })} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Spinner size="sm" />}
              {modal.mode === 'create' ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={resetModal.open} onClose={() => setResetModal({ open: false })} title="Reset Password" size="sm">
        <form onSubmit={handleResetPassword} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <p className="text-sm text-slate-500">Set a new password for <strong>{resetModal.user?.username}</strong></p>
          <FormField label="New Password">
            <input type="password" className="input" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
          </FormField>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setResetModal({ open: false })} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Spinner size="sm" />} Reset Password
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false })}
        onConfirm={handleConfirm}
        loading={saving}
        title={confirmModal.action === 'toggle-lock'
          ? `${confirmModal.user?.isLocked ? 'Unlock' : 'Lock'} ${confirmModal.user?.username}?`
          : `${confirmModal.user?.isActive ? 'Deactivate' : 'Activate'} ${confirmModal.user?.username}?`
        }
        message="This will immediately affect the user's access."
      />
    </Layout>
  )
}