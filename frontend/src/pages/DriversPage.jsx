import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { driversAPI } from '../api/index'
import Layout from '../components/layout/Layout'
import { Table, Badge, ConfirmModal, PageLoader, Spinner, Modal, FormField } from '../components/common/index'
import { Plus, Pencil, Power, Lock, CheckCircle, XCircle, Truck, MapPin, Phone } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import React from 'react'

const STATUS_BADGE = {
  pending:    { type: 'inactive', label: 'Pending' },
  approved:   { type: 'active',   label: 'Approved' },
  rejected:   { type: 'locked',   label: 'Rejected' },
  // Legacy values from old schema
  Active:     { type: 'active',   label: 'Approved' },
  Suspended:  { type: 'locked',   label: 'Suspended' },
  Pending:    { type: 'inactive', label: 'Pending' },
}

export default function DriversPage() {
  const navigate = useNavigate()
  const { isSuperAdmin, hasPermission } = useAuth()

  const [drivers,       setDrivers]       = useState([])
  const [roles,         setRoles]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [filterStatus,  setFilterStatus]  = useState('')
  const [confirm,       setConfirm]       = useState({ open: false, type: '', item: null })
  const [approveModal,  setApproveModal]  = useState({ open: false, driver: null })
  const [rejectModal,   setRejectModal]   = useState({ open: false, driver: null })
  const [approveForm,   setApproveForm]   = useState({ username: '', roleId: '', approvalNote: '' })
  const [rejectNote,    setRejectNote]    = useState('')
  const [saving,        setSaving]        = useState(false)
  const [actionError,   setActionError]   = useState('')

  useEffect(() => { load() }, [filterStatus])

  const load = async () => {
    setLoading(true)
    try {
      const [d, r] = await Promise.all([
        driversAPI.getAll(filterStatus ? { status: filterStatus } : {}),
        driversAPI.getRoles(),
      ])
      setDrivers(d.data.data)
      setRoles(r.data.data.filter(r => r.isActive))
    } catch (err) {
      console.error('Load drivers error:', err.response?.status, err.response?.data)
      setDrivers([])
    } finally { setLoading(false) }
  }

  const openApprove = (driver) => {
    setApproveForm({
      username: driver.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
      roleId: '',
      approvalNote: '',
    })
    setActionError('')
    setApproveModal({ open: true, driver })
  }

  const handleApprove = async (e) => {
    e.preventDefault(); setSaving(true); setActionError('')
    try {
      await driversAPI.approve(approveModal.driver._id, approveForm)
      setApproveModal({ open: false }); load()
    } catch (err) { setActionError(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const openReject = (driver) => {
    setRejectNote(''); setActionError(''); setRejectModal({ open: true, driver })
  }

  const handleReject = async (e) => {
    e.preventDefault(); setSaving(true); setActionError('')
    try {
      await driversAPI.reject(rejectModal.driver._id, { approvalNote: rejectNote })
      setRejectModal({ open: false }); load()
    } catch (err) { setActionError(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleToggle = async () => {
    setSaving(true)
    try {
      if (confirm.type === 'active') await driversAPI.toggleActive(confirm.item._id)
      else await driversAPI.toggleLock(confirm.item._id)
      setConfirm({ open: false }); load()
    } finally { setSaving(false) }
  }

  if (loading) return <Layout title="Delivery Partners"><PageLoader /></Layout>

  return (
    <Layout title="Delivery Partners" subtitle="Driver Management">
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-semibold text-slate-800">All Delivery Partners</h3>
            <p className="text-xs text-slate-400 mt-0.5">{drivers.length} total drivers</p>
          </div>
          <div className="flex items-center gap-3">
            <select className="input w-40 text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            {(isSuperAdmin || hasPermission('SCREEN_ALL_DRIVERS', 'canCreate')) && (
              <button onClick={() => navigate('/admin/add-driver')} className="btn-primary">
                <Plus size={16} /> Add Driver
              </button>
            )}
          </div>
        </div>

        <Table
          headers={['Driver', 'Contact', 'Location', 'Vehicle', 'Status', 'Portal Access', 'Actions']}
          empty={drivers.length === 0}
        >
          {drivers.map(d => (
            <tr key={d._id} className="hover:bg-slate-50 transition-colors">

              {/* Driver */}
              <td className="table-cell">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Truck size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{d.name}</div>
                    <div className="text-xs text-slate-400">{d.nic}</div>
                  </div>
                </div>
              </td>

              {/* Contact */}
              <td className="table-cell">
                <div className="flex items-center gap-1.5 text-sm text-slate-700">
                  <Phone size={12} className="text-slate-400" />
                  {d.phone}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{d.email}</div>
              </td>

              {/* Location */}
              <td className="table-cell">
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-slate-700">{d.location?.district}</div>
                    <div className="text-xs text-slate-400">{d.location?.province}</div>
                  </div>
                </div>
              </td>

              {/* Vehicle */}
              <td className="table-cell">
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full font-medium">
                  {d.vehicle?.type || '—'}
                </span>
                {d.vehicle?.licensePlate && (
                  <div className="text-xs text-slate-400 mt-0.5">{d.vehicle.licensePlate}</div>
                )}
              </td>

              {/* Status */}
              <td className="table-cell"><Badge {...(STATUS_BADGE[d.accountStatus] || { type: 'inactive', label: d.accountStatus })} /></td>

              {/* Portal Access */}
              <td className="table-cell">
                {(d.accountStatus === 'approved' || d.accountStatus === 'Active')
                  ? <div>
                      <div className="text-xs font-mono text-slate-700">{d.username}</div>
                      <div className="flex gap-1 mt-1">
                        <Badge type={d.isActive !== false ? 'active' : 'inactive'} label={d.isActive !== false ? 'Active' : 'Inactive'} />
                        {d.isLocked && <Badge type="locked" label="Locked" />}
                      </div>
                    </div>
                  : <span className="text-xs text-slate-400">—</span>
                }
              </td>

              {/* Actions */}
              <td className="table-cell">
                <div className="flex items-center gap-1">
                  {(d.accountStatus === 'pending' || d.accountStatus === 'Pending') && <>
                    <button onClick={() => openApprove(d)} title="Approve"
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-50 text-emerald-600">
                      <CheckCircle size={14} />
                    </button>
                    <button onClick={() => openReject(d)} title="Reject"
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400">
                      <XCircle size={14} />
                    </button>
                  </>}
                  {(d.accountStatus === 'approved' || d.accountStatus === 'Active') && <>
                    <button onClick={() => setConfirm({ open: true, type: 'active', item: d })}
                      title={d.isActive !== false ? 'Deactivate' : 'Activate'}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg ${d.isActive !== false ? 'hover:bg-red-50 text-red-400' : 'hover:bg-emerald-50 text-emerald-500'}`}>
                      <Power size={14} />
                    </button>
                    <button onClick={() => setConfirm({ open: true, type: 'lock', item: d })}
                      title={d.isLocked ? 'Unlock' : 'Lock'}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg ${d.isLocked ? 'hover:bg-emerald-50 text-emerald-500' : 'hover:bg-amber-50 text-amber-500'}`}>
                      <Lock size={14} />
                    </button>
                  </>}
                </div>
              </td>

            </tr>
          ))}
        </Table>
      </div>

      {/* Approve Modal */}
      <Modal open={approveModal.open} onClose={() => setApproveModal({ open: false })}
        title="Approve Driver & Set Portal Access" size="md">
        <form onSubmit={handleApprove} className="p-6 space-y-4">
          {actionError && <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{actionError}</p>}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Truck size={20} className="text-emerald-600" />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-800">{approveModal.driver?.name}</div>
              <div className="text-xs text-slate-500">{approveModal.driver?.email}</div>
            </div>
          </div>
          <FormField label="Portal Username">
            <input className="input font-mono" value={approveForm.username}
              onChange={e => setApproveForm(p => ({ ...p, username: e.target.value.toLowerCase().replace(/\s/g, '') }))}
              required placeholder="e.g. john_driver" />
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
            A random password will be auto-generated and sent to the driver's email along with username and role.
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setApproveModal({ open: false })} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Spinner size="sm" />} Approve & Send Credentials
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectModal.open} onClose={() => setRejectModal({ open: false })}
        title="Reject Driver Application" size="sm">
        <form onSubmit={handleReject} className="p-6 space-y-4">
          {actionError && <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{actionError}</p>}
          <p className="text-sm text-slate-600">
            Rejecting <strong>{rejectModal.driver?.name}</strong>. An email will be sent to notify them.
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

      {/* Toggle Confirm */}
      <ConfirmModal
        open={confirm.open} onClose={() => setConfirm({ open: false })}
        onConfirm={handleToggle} loading={saving}
        title={confirm.type === 'active'
          ? `${confirm.item?.isActive ? 'Deactivate' : 'Activate'} "${confirm.item?.name}"?`
          : `${confirm.item?.isLocked ? 'Unlock' : 'Lock'} "${confirm.item?.name}"?`}
        message={confirm.type === 'active'
          ? confirm.item?.isActive ? 'Driver portal access will be suspended.' : 'Driver portal access will be restored.'
          : confirm.item?.isLocked ? 'Driver will be able to log in again.' : 'Driver will be locked out of the portal.'}
      />
    </Layout>
  )
}
