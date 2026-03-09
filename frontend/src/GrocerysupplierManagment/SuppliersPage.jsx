import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { suppliersAPI, rolesAPI } from '../api/index'
import Layout from '../components/layout/Layout'
import { Table, Badge, ConfirmModal, PageLoader, Spinner, Modal, FormField } from '../components/common/index'
import { Plus, Pencil, Power, Lock, Eye, CheckCircle, XCircle, UserCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import React from 'react'

const STATUS_BADGE = {
  pending:  { type: 'inactive', label: 'Pending' },
  approved: { type: 'active',   label: 'Approved' },
  rejected: { type: 'locked',   label: 'Rejected' },
}

export default function SuppliersPage() {
  const navigate = useNavigate()
  const { isSuperAdmin, hasPermission } = useAuth()

  const [suppliers,    setSuppliers]    = useState([])
  const [roles,        setRoles]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [confirm,      setConfirm]      = useState({ open: false, type: '', item: null })
  const [approveModal, setApproveModal] = useState({ open: false, supplier: null })
  const [rejectModal,  setRejectModal]  = useState({ open: false, supplier: null })
  const [approveForm,  setApproveForm]  = useState({ username: '', roleId: '', approvalNote: '' })
  const [rejectNote,   setRejectNote]   = useState('')
  const [saving,       setSaving]       = useState(false)
  const [actionError,  setActionError]  = useState('')

  useEffect(() => { load() }, [filterStatus, isSuperAdmin])

  const load = async () => {
    setLoading(true)
    try {
      if (isSuperAdmin) {
        // SuperAdmin: fetch all suppliers (filterable) + roles for approve modal
        const [s, r] = await Promise.all([
          suppliersAPI.getAll(filterStatus ? { status: filterStatus } : {}),
          rolesAPI.getAll(),
        ])
        setSuppliers(s.data.data)
        setRoles(r.data.data.filter(r => r.isActive && !r.isSuperAdmin))
      } else {
        // Manager: fetch approved suppliers only, no roles needed
        const s = await suppliersAPI.getApproved()
        setSuppliers(s.data.data)
      }
    } catch (err) {
      console.error('Load suppliers error:', err.response?.status, err.response?.data)
      setSuppliers([])
    } finally { setLoading(false) }
  }

  const openApprove = (supplier) => {
    setApproveForm({
      username: supplier.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
      roleId: '',
      approvalNote: '',
    })
    setActionError('')
    setApproveModal({ open: true, supplier })
  }

  const handleApprove = async (e) => {
    e.preventDefault(); setSaving(true); setActionError('')
    try {
      await suppliersAPI.approve(approveModal.supplier._id, approveForm)
      setApproveModal({ open: false }); load()
    } catch (err) { setActionError(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const openReject = (supplier) => {
    setRejectNote(''); setActionError(''); setRejectModal({ open: true, supplier })
  }

  const handleReject = async (e) => {
    e.preventDefault(); setSaving(true); setActionError('')
    try {
      await suppliersAPI.reject(rejectModal.supplier._id, { approvalNote: rejectNote })
      setRejectModal({ open: false }); load()
    } catch (err) { setActionError(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleToggle = async () => {
    setSaving(true)
    try {
      if (confirm.type === 'active') await suppliersAPI.toggleActive(confirm.item._id)
      else await suppliersAPI.toggleLock(confirm.item._id)
      setConfirm({ open: false }); load()
    } finally { setSaving(false) }
  }

  if (loading) return <Layout title="Suppliers"><PageLoader /></Layout>

  return (
    <Layout title="Suppliers" subtitle="Supplier Management">
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-semibold text-slate-800">
              {isSuperAdmin ? 'All Suppliers' : 'Approved Suppliers'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{suppliers.length} total suppliers</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Status filter — superadmin only */}
            {isSuperAdmin && (
              <select className="input w-40 text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
            {/* Add button — superadmin or users with canCreate */}
            {(isSuperAdmin || hasPermission('SCREEN_SUPPLIERS', 'canCreate')) && (
              <button onClick={() => navigate('/suppliers/add')} className="btn-primary">
                <Plus size={16} /> Add Supplier
              </button>
            )}
          </div>
        </div>

        <Table
          headers={['Supplier', 'Contact', 'Categories', 'Status', 'Portal Access', 'Actions']}
          empty={suppliers.length === 0}
        >
          {suppliers.map(s => (
            <tr key={s._id} className="hover:bg-slate-50 transition-colors">

              {/* Supplier */}
              <td className="table-cell">
                <div className="flex items-center gap-3">
                  {s.profilePic
                    ? <img src={s.profilePic} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                    : <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center"><UserCircle size={20} className="text-emerald-600" /></div>
                  }
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{s.businessName}</div>
                    <div className="text-xs text-slate-400">{s.businessType}</div>
                  </div>
                </div>
              </td>

              {/* Contact */}
              <td className="table-cell">
                <div className="text-sm text-slate-700">{s.contactPersonName}</div>
                <div className="text-xs text-slate-400">{s.email}</div>
              </td>

              {/* Categories */}
              <td className="table-cell">
                <div className="flex flex-wrap gap-1 max-w-[180px]">
                  {s.supplyCategories?.slice(0, 3).map((c, i) => (
                    <span key={i} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                      {c.category} ({c.quantity}{c.unit})
                    </span>
                  ))}
                  {s.supplyCategories?.length > 3 && (
                    <span className="text-xs text-slate-400">+{s.supplyCategories.length - 3} more</span>
                  )}
                </div>
              </td>

              {/* Status */}
              <td className="table-cell"><Badge {...STATUS_BADGE[s.status]} /></td>

              {/* Portal Access */}
              <td className="table-cell">
                {s.status === 'approved'
                  ? <div>
                      <div className="text-xs font-mono text-slate-700">{s.username}</div>
                      <div className="flex gap-1 mt-1">
                        <Badge type={s.isActive ? 'active' : 'inactive'} label={s.isActive ? 'Active' : 'Inactive'} />
                        {s.isLocked && <Badge type="locked" label="Locked" />}
                      </div>
                    </div>
                  : <span className="text-xs text-slate-400">—</span>
                }
              </td>

              {/* Actions */}
              <td className="table-cell">
                <div className="flex items-center gap-1">
                  {isSuperAdmin ? (
                    <>
                      {/* SuperAdmin: full action set */}
                      <button onClick={() => navigate(`/suppliers/edit/${s._id}`)} title="Edit"
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">
                        <Pencil size={14} />
                      </button>
                      {s.status === 'pending' && <>
                        <button onClick={() => openApprove(s)} title="Approve"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-50 text-emerald-600">
                          <CheckCircle size={14} />
                        </button>
                        <button onClick={() => openReject(s)} title="Reject"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400">
                          <XCircle size={14} />
                        </button>
                      </>}
                      {s.status === 'approved' && <>
                        <button onClick={() => setConfirm({ open: true, type: 'active', item: s })}
                          title={s.isActive ? 'Deactivate' : 'Activate'}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg ${s.isActive ? 'hover:bg-red-50 text-red-400' : 'hover:bg-emerald-50 text-emerald-500'}`}>
                          <Power size={14} />
                        </button>
                        <button onClick={() => setConfirm({ open: true, type: 'lock', item: s })}
                          title={s.isLocked ? 'Unlock' : 'Lock'}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg ${s.isLocked ? 'hover:bg-emerald-50 text-emerald-500' : 'hover:bg-amber-50 text-amber-500'}`}>
                          <Lock size={14} />
                        </button>
                      </>}
                    </>
                  ) : (
                    <>
                      {/* Manager: view always visible, edit only if permitted */}
                      <button onClick={() => navigate(`/suppliers/${s._id}`)} title="View"
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">
                        <Eye size={14} />
                      </button>
                      {hasPermission('SCREEN_SUPPLIERS', 'canEdit') && (
                        <button onClick={() => navigate(`/suppliers/edit/${s._id}`)} title="Edit"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">
                          <Pencil size={14} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </td>

            </tr>
          ))}
        </Table>
      </div>

      {/* Approve Modal — superadmin only */}
      {isSuperAdmin && (
        <Modal open={approveModal.open} onClose={() => setApproveModal({ open: false })}
          title="Approve Supplier & Set Portal Access" size="md">
          <form onSubmit={handleApprove} className="p-6 space-y-4">
            {actionError && <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{actionError}</p>}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {approveModal.supplier?.profilePic
                ? <img src={approveModal.supplier.profilePic} alt="" className="w-10 h-10 rounded-full object-cover" />
                : <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center"><UserCircle size={22} className="text-emerald-600" /></div>
              }
              <div>
                <div className="font-semibold text-sm text-slate-800">{approveModal.supplier?.businessName}</div>
                <div className="text-xs text-slate-500">{approveModal.supplier?.email}</div>
              </div>
            </div>
            <FormField label="Portal Username">
              <input className="input font-mono" value={approveForm.username}
                onChange={e => setApproveForm(p => ({ ...p, username: e.target.value.toLowerCase().replace(/\s/g, '') }))}
                required placeholder="e.g. greenfarm_supplier" />
            </FormField>
            <FormField label="Assign Role">
              <select className="input" value={approveForm.roleId}
                onChange={e => setApproveForm(p => ({ ...p, roleId: e.target.value }))} required>
                <option value="">— Select Role —</option>
                {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
              </select>
            </FormField>
            <FormField label="Approval Note (optional)">
              <textarea className="input h-20 resize-none" value={approveForm.approvalNote}
                onChange={e => setApproveForm(p => ({ ...p, approvalNote: e.target.value }))}
                placeholder="Welcome message or internal notes..." />
            </FormField>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-2 rounded-lg">
              A random password will be auto-generated and sent to the supplier's email along with username and role.
            </div>
            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setApproveModal({ open: false })} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving && <Spinner size="sm" />} Approve & Send Credentials
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reject Modal — superadmin only */}
      {isSuperAdmin && (
        <Modal open={rejectModal.open} onClose={() => setRejectModal({ open: false })}
          title="Reject Supplier Application" size="sm">
          <form onSubmit={handleReject} className="p-6 space-y-4">
            {actionError && <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{actionError}</p>}
            <p className="text-sm text-slate-600">
              Rejecting <strong>{rejectModal.supplier?.businessName}</strong>. An email will be sent to notify them.
            </p>
            <FormField label="Reason (optional)">
              <textarea className="input h-24 resize-none" value={rejectNote}
                onChange={e => setRejectNote(e.target.value)} placeholder="Explain the reason for rejection..." />
            </FormField>
            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setRejectModal({ open: false })} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2">
                {saving && <Spinner size="sm" />} Reject & Notify
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Toggle Confirm — superadmin only */}
      {isSuperAdmin && (
        <ConfirmModal
          open={confirm.open} onClose={() => setConfirm({ open: false })}
          onConfirm={handleToggle} loading={saving}
          title={confirm.type === 'active'
            ? `${confirm.item?.isActive ? 'Deactivate' : 'Activate'} "${confirm.item?.businessName}"?`
            : `${confirm.item?.isLocked ? 'Unlock' : 'Lock'} "${confirm.item?.businessName}"?`}
          message={confirm.type === 'active'
            ? confirm.item?.isActive ? 'Supplier portal access will be suspended.' : 'Supplier portal access will be restored.'
            : confirm.item?.isLocked ? 'Supplier will be able to log in again.' : 'Supplier will be locked out of the portal.'}
        />
      )}
    </Layout>
  )
}