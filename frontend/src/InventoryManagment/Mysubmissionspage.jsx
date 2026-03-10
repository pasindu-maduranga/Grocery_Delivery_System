import { useState, useEffect } from 'react'
import { grocerySubmissionsAPI } from '../api/index'
import Layout from '../components/layout/Layout'
import { Badge, PageLoader } from '../components/common/index'
import { ClipboardList, ImageOff, Clock, CheckCircle2, XCircle } from 'lucide-react'
import React from 'react'

const STATUS_STYLES = {
  pending:  { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Pending' },
  accepted: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Accepted' },
  rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-50', border: 'border-red-200', label: 'Rejected' },
}

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await grocerySubmissionsAPI.getMy()
      setSubmissions(res.data.data)
    } finally { setLoading(false) }
  }

  const filtered = filter ? submissions.filter(s => s.status === filter) : submissions

  if (loading) return <Layout title="My Submissions"><PageLoader /></Layout>

  return (
    <Layout title="My Submissions" subtitle="Track items sent to admin">
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-semibold text-slate-800">Submission History</h3>
            <p className="text-xs text-slate-400 mt-0.5">{submissions.length} total submissions</p>
          </div>
          <select className="input w-40 text-sm" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
            <ClipboardList size={48} className="text-slate-200" />
            <p className="text-sm font-medium">No submissions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(sub => {
              const style = STATUS_STYLES[sub.status]
              const Icon = style.icon
              return (
                <div key={sub._id} className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                    {sub.groceryItem?.image
                      ? <img src={sub.groceryItem.image} alt="" className="w-full h-full object-cover" />
                      : <ImageOff size={20} className="text-slate-300" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">{sub.groceryItem?.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{sub.groceryItem?.groceryType}</div>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${style.bg} ${style.border} ${style.color}`}>
                        <Icon size={11} />
                        {style.label}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
                      <span>Sent: <strong>{sub.quantitySent} {sub.groceryItem?.measuringUnit}</strong></span>
                      {sub.quantityAccepted && <span>Accepted: <strong className="text-emerald-600">{sub.quantityAccepted} {sub.groceryItem?.measuringUnit}</strong></span>}
                      <span>Unit: <strong>${sub.unitPrice}</strong></span>
                      {sub.discountPercent > 0 && <span>Discount: <strong className="text-emerald-600">{sub.discountPercent}%</strong></span>}
                      <span>Total: <strong className="text-slate-800">${sub.totalPrice}</strong></span>
                    </div>
                    {sub.reviewNote && (
                      <div className={`mt-2 text-xs px-3 py-1.5 rounded-lg border ${style.bg} ${style.border} ${style.color}`}>
                        Admin note: {sub.reviewNote}
                      </div>
                    )}
                    <div className="mt-1.5 text-xs text-slate-400">
                      {new Date(sub.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}