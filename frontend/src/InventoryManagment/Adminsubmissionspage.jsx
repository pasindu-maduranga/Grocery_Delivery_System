import { useState, useEffect } from 'react'
import { grocerySubmissionsAPI } from '../api/index'
import Layout from '../components/layout/Layout'
import { PageLoader, Spinner, Modal, FormField } from '../components/common/index'
import { CheckCircle2, XCircle, Clock, Eye, ImageOff, Tag, Package } from 'lucide-react'
import React from 'react'

const STATUS_STYLES = {
  pending:  { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400' },
  accepted: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  rejected: { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-400' },
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [viewModal, setViewModal] = useState({ open: false, sub: null })
  const [acceptModal, setAcceptModal] = useState({ open: false, sub: null })
  const [rejectModal, setRejectModal] = useState({ open: false, sub: null })
  const [acceptQty, setAcceptQty] = useState('')
  const [rejectNote, setRejectNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => { load() }, [filter])

  const load = async () => {
    setLoading(true)
    try {
      const res = await grocerySubmissionsAPI.getAll(filter ? { status: filter } : {})
      setSubmissions(res.data.data)
    } finally { setLoading(false) }
  }

  const handleAccept = async (e) => {
    e.preventDefault()
    setSaving(true)
    setActionError('')
    try {
      await grocerySubmissionsAPI.accept(acceptModal.sub._id, { quantityAccepted: Number(acceptQty) })
      setAcceptModal({ open: false, sub: null })
      load()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed')
    } finally { setSaving(false) }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    setSaving(true)
    setActionError('')
    try {
      await grocerySubmissionsAPI.reject(rejectModal.sub._id, { reviewNote: rejectNote })
      setRejectModal({ open: false, sub: null })
      load()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed')
    } finally { setSaving(false) }
  }

  const openAccept = (sub) => {
    setAcceptQty(sub.quantitySent)
    setActionError('')
    setAcceptModal({ open: true, sub })
  }

  if (loading) return <Layout title="Grocery Submissions"><PageLoader /></Layout>

  return (
    <Layout title="Grocery Submissions" subtitle="Review supplier submissions">
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-semibold text-slate-800">Supplier Submissions</h3>
            <p className="text-xs text-slate-400 mt-0.5">{submissions.length} submissions</p>
          </div>
          <div className="flex gap-2">
            {['', 'pending', 'accepted', 'rejected'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === s ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
            <Package size={48} className="text-slate-200" />
            <p className="text-sm font-medium">No submissions found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {submissions.map(sub => {
              const style = STATUS_STYLES[sub.status]
              return (
                <div key={sub._id} className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 flex items-center justify-center">
                    {sub.groceryItem?.image
                      ? <img src={sub.groceryItem.image} alt="" className="w-full h-full object-cover" />
                      : <ImageOff size={20} className="text-slate-300" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">{sub.groceryItem?.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{sub.supplier?.businessName} · {sub.groceryItem?.groceryType}</div>
                      </div>
                      <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${style.bg} ${style.border} ${style.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
                      <span>Qty: <strong>{sub.quantitySent} {sub.groceryItem?.measuringUnit}</strong></span>
                      <span>Unit Price: <strong>${sub.unitPrice}</strong></span>
                      {sub.discountPercent > 0 && <span className="text-emerald-600">Discount: <strong>{sub.discountPercent}%</strong></span>}
                      <span>Total: <strong className="text-slate-800 text-sm">${sub.totalPrice}</strong></span>
                      {sub.quantityAccepted && <span>Accepted: <strong className="text-emerald-600">{sub.quantityAccepted} {sub.groceryItem?.measuringUnit}</strong></span>}
                    </div>

                    {sub.note && <p className="mt-1.5 text-xs text-slate-500 italic">"{sub.note}"</p>}

                    <div className="mt-2 text-xs text-slate-400">
                      {new Date(sub.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {sub.status === 'pending' && (
                      <div className="mt-3 flex items-center gap-2">
                        <button onClick={() => openAccept(sub)}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                          <CheckCircle2 size={12} /> Accept
                        </button>
                        <button onClick={() => { setRejectNote(''); setActionError(''); setRejectModal({ open: true, sub }) }}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors">
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    )}

                    {sub.reviewNote && (
                      <div className={`mt-2 text-xs px-3 py-1.5 rounded-lg border ${style.bg} ${style.border} ${style.color}`}>
                        Review note: {sub.reviewNote}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal open={acceptModal.open} onClose={() => setAcceptModal({ open: false, sub: null })}
        title="Accept Submission" size="sm">
        <form onSubmit={handleAccept} className="p-6 space-y-4">
          {actionError && <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{actionError}</p>}
          {acceptModal.sub && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-semibold text-sm text-slate-800">{acceptModal.sub.groceryItem?.name}</div>
              <div className="text-xs text-slate-500">Supplier sent: <strong>{acceptModal.sub.quantitySent} {acceptModal.sub.groceryItem?.measuringUnit}</strong></div>
              <div className="text-xs text-slate-500">Total price: <strong>${acceptModal.sub.totalPrice}</strong></div>
            </div>
          )}
          <FormField label={`Quantity to Accept (max ${acceptModal.sub?.quantitySent} ${acceptModal.sub?.groceryItem?.measuringUnit})`}>
            <input className="input" type="number" min="1" max={acceptModal.sub?.quantitySent}
              value={acceptQty} onChange={e => setAcceptQty(e.target.value)} required />
          </FormField>
          {acceptQty && Number(acceptQty) > 0 && (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
              Accepting {acceptQty} {acceptModal.sub?.groceryItem?.measuringUnit} →
              will add to inventory and deduct from supplier stock
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setAcceptModal({ open: false, sub: null })} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Spinner size="sm" />} <CheckCircle2 size={14} /> Accept & Add to Inventory
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={rejectModal.open} onClose={() => setRejectModal({ open: false, sub: null })}
        title="Reject Submission" size="sm">
        <form onSubmit={handleReject} className="p-6 space-y-4">
          {actionError && <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{actionError}</p>}
          <p className="text-sm text-slate-600">
            Rejecting <strong>{rejectModal.sub?.groceryItem?.name}</strong> from <strong>{rejectModal.sub?.supplier?.businessName}</strong>.
            Supplier will be notified.
          </p>
          <FormField label="Reason (optional)">
            <textarea className="input h-24 resize-none" value={rejectNote}
              onChange={e => setRejectNote(e.target.value)} placeholder="Explain why this submission is rejected..." />
          </FormField>
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setRejectModal({ open: false, sub: null })} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2">
              {saving && <Spinner size="sm" />} Reject & Notify Supplier
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}