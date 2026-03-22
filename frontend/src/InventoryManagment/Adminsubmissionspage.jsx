import { useState, useEffect } from 'react'
import { grocerySubmissionsAPI, paymentsAPI, storefrontAPI } from '../api/index'
import Layout from '../components/layout/Layout'
import { PageLoader, Spinner, Modal, FormField } from '../components/common/index'
import { 
  CheckCircle2, XCircle, Clock, Eye, ImageOff, 
  Tag, Package, CreditCard, ArrowRight,
  TrendingUp, IndianRupee, Info, Search, Filter,
  Globe, AlertCircle
} from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

const STATUS_STYLES = {
  pending:  { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400', label: 'Pending' },
  accepted: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Accepted' },
  rejected: { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', label: 'Rejected' },
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [search, setSearch] = useState('')
  
  const [acceptModal, setAcceptModal] = useState({ open: false, sub: null })
  const [rejectModal, setRejectModal] = useState({ open: false, sub: null })
  const [paymentModal, setPaymentModal] = useState({ open: false, sub: null })
  const [syncModal, setSyncModal] = useState({ open: false, sub: null })

  const [acceptQty, setAcceptQty] = useState('')
  const [rejectNote, setRejectNote] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { 
    load() 
    checkStripeSession()
  }, [filter])

  const checkStripeSession = async () => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    const submissionId = params.get('submission_id')
    
    if (sessionId && submissionId) {
      toast.loading('Confirming payment...', { id: 'stripe-confirm' })
      try {
        await paymentsAPI.confirmPayment({ sessionId, submissionId })
        toast.success('Payment confirmed! Inventory settled.', { id: 'stripe-confirm' })
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname)
        load()
      } catch (err) {
        toast.error('Payment verification failed', { id: 'stripe-confirm' })
      }
    }
  }

  const load = async () => {
    setLoading(true)
    try {
      const res = await grocerySubmissionsAPI.getAll(filter ? { status: filter } : {})
      setSubmissions(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load submissions')
    } finally { setLoading(false) }
  }

  const handleAccept = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await grocerySubmissionsAPI.accept(acceptModal.sub._id, { quantityAccepted: Number(acceptQty) })
      toast.success('Submission accepted and inventory updated')
      setAcceptModal({ open: false, sub: null })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept submission')
    } finally { setSaving(false) }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await grocerySubmissionsAPI.reject(rejectModal.sub._id, { reviewNote: rejectNote })
      toast.success('Submission rejected and supplier notified')
      setRejectModal({ open: false, sub: null })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject submission')
    } finally { setSaving(false) }
  }

  const handlePayment = async () => {
    setSaving(true)
    try {
      const { data } = await paymentsAPI.createPaymentIntent({ submissionId: paymentModal.sub._id })
      
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Failed to create checkout session URL')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment')
    } finally { setSaving(false) }
  }

  const handleSync = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await paymentsAPI.syncToStorefront({ 
        submissionId: syncModal.sub._id,
        sellingPrice: Number(sellingPrice)
      })
      toast.success('Product synced to storefront successfully')
      setSyncModal({ open: false, sub: null })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sync failed')
    } finally { setSaving(false) }
  }

  const filtered = submissions.filter(s => 
    s.groceryItem?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.supplier?.businessName?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Layout title="Review Submissions"><PageLoader /></Layout>

  return (
    <Layout title="Inventory Review" subtitle="Verify supplier shipments and process payouts">
      <div className="max-w-[1200px] mx-auto px-6 pt-4 pb-20">
        
        {/* Sub Header */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-10">
           <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 w-full md:w-auto overflow-x-auto no-scrollbar">
              {['pending', 'accepted', 'rejected'].map(t => (
                 <button 
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap capitalize ${
                      filter === t ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/10' : 'text-slate-400 hover:text-slate-600'
                    }`}
                 >
                    {t}
                 </button>
              ))}
              <button 
                onClick={() => setFilter('')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  filter === '' ? 'bg-emerald-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                All
              </button>
           </div>

           <div className="relative group w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search supplier or item..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-11 h-11 bg-white border-slate-200 focus:ring-0 shadow-sm"
              />
           </div>
        </div>

        {/* New Header Section with View History Button */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Inventory Submissions</h1>
            <p className="text-slate-400 font-medium">Review and process supplier batches with one-click settlements</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => window.location.href = '/transactions'}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all mr-2"
            >
              <CreditCard size={14} /> View History
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card py-24 border-dashed border-2 flex flex-col items-center bg-white/50">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Package size={40} className="text-slate-300" />
             </div>
             <h3 className="text-xl font-bold text-slate-800">No submissions to show</h3>
             <p className="text-sm text-slate-500 mt-2">Currently there are no entries matching this filter.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map(sub => {
              const style = STATUS_STYLES[sub.status] || STATUS_STYLES.pending
              
              return (
                <div key={sub._id} className="card group hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 bg-white border border-slate-100 overflow-hidden flex flex-col md:flex-row items-stretch">
                  <div className={`w-1.5 flex-shrink-0 ${sub.status === 'accepted' ? 'bg-emerald-500' : sub.status === 'rejected' ? 'bg-red-500' : 'bg-amber-400'}`}></div>

                  <div className="p-6 flex-1 flex flex-col md:flex-row gap-6">
                    {/* Product Preview */}
                    <div className="w-full md:w-32 h-32 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 relative group/img">
                      {sub.groceryItem?.image ? (
                        <img src={sub.groceryItem.image} alt="" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                          <ImageOff size={24} />
                        </div>
                      )}
                    </div>

                    {/* Detailed Info */}
                    <div className="flex-1 flex flex-col justify-between">
                       <div>
                          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                             <div>
                                <h4 className="text-lg font-bold text-slate-800 line-clamp-1">{sub.groceryItem?.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                                   <span className="text-emerald-600">{sub.supplier?.businessName}</span>
                                   <span className="opacity-30">•</span>
                                   <span>{sub.groceryItem?.groceryType}</span>
                                </div>
                             </div>
                             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${style.bg} ${style.border} ${style.color}`}>
                                <div className={`w-2 h-2 rounded-full ${style.dot} ${sub.status === 'pending' ? 'animate-pulse' : ''}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{style.label}</span>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                             <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                                <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Sent Qty</p>
                                <p className="text-sm font-black text-slate-700">{sub.quantitySent} {sub.groceryItem?.measuringUnit}</p>
                             </div>
                             <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                                <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Unit Price</p>
                                <p className="text-sm font-black text-slate-700">LKR {sub.unitPrice}</p>
                             </div>
                             <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <p className="text-[10px] uppercase font-black text-emerald-600 mb-1">Accepted Qty</p>
                                <p className="text-sm font-black text-emerald-900">{sub.quantityAccepted || '--'} {sub.groceryItem?.measuringUnit}</p>
                             </div>
                             <div className="p-3 bg-emerald-900 rounded-xl shadow-lg shadow-emerald-900/10">
                                <p className="text-[10px] uppercase font-black text-emerald-400 mb-1">Payable Total</p>
                                <p className="text-sm font-black text-white">LKR {sub.totalPrice.toLocaleString()}</p>
                             </div>
                          </div>
                       </div>
                       
                       {sub.note && (
                        <div className="mt-4 flex gap-2 p-2 bg-amber-50 rounded-lg border border-amber-100 text-[11px] text-amber-700 italic">
                           <Info size={14} className="flex-shrink-0" />
                           "{sub.note}"
                        </div>
                       )}
                    </div>
                  </div>

                  {/* Actions Sidebar */}
                  <div className="w-full md:w-72 bg-slate-50/50 p-6 flex flex-col justify-center border-l border-slate-100">
                     {sub.status === 'pending' ? (
                       <div className="space-y-3">
                          <button onClick={() => { setAcceptQty(sub.quantitySent); setAcceptModal({ open: true, sub }) }} 
                            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                             <CheckCircle2 size={16} /> Verify & Accept
                          </button>
                          <button onClick={() => { setRejectNote(''); setRejectModal({ open: true, sub }) }}
                            className="w-full h-11 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                             <XCircle size={16} /> Decline
                          </button>
                       </div>
                     ) : sub.status === 'accepted' ? (
                       <div className="space-y-3">
                          {!sub.isPaid ? (
                            <button onClick={() => setPaymentModal({ open: true, sub })}
                              className="w-full h-12 bg-emerald-900 hover:bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95">
                               <CreditCard size={18} /> Process Payment
                            </button>
                          ) : (
                            <div className="space-y-3">
                               <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 text-xs justify-center">
                                  <CheckCircle2 size={16} /> Settlement Paid
                               </div>
                               {!sub.isSynced ? (
                                 <button onClick={() => { setSellingPrice(sub.unitPrice * 1.5); setSyncModal({ open: true, sub }) }}
                                   className="w-full h-12 bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-100 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02]">
                                    <TrendingUp size={18} /> Sync Storefront
                                 </button>
                               ) : (
                                 <div className="flex items-center gap-2 text-blue-600 font-bold bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 text-xs justify-center italic">
                                    <TrendingUp size={16} /> Live on Storefront
                                 </div>
                               )}
                            </div>
                          )}
                       </div>
                     ) : (
                       <div className="flex flex-col items-center justify-center opacity-50 grayscale">
                          <XCircle size={32} className="text-slate-300 mb-2" />
                          <p className="text-[10px] font-black uppercase text-slate-400">Archived</p>
                       </div>
                     )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Accept Modal */}
      <Modal open={acceptModal.open} onClose={() => setAcceptModal({ open: false, sub: null })} title="Confirm Stock Arrival" size="md">
        <form onSubmit={handleAccept} className="p-8 space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Verification Context</p>
             <h5 className="font-bold text-slate-800">{acceptModal.sub?.groceryItem?.name}</h5>
             <p className="text-xs text-slate-500">Shipped: {acceptModal.sub?.quantitySent} {acceptModal.sub?.groceryItem?.measuringUnit}</p>
          </div>
          
          <FormField label={`Received Quantity (${acceptModal.sub?.groceryItem?.measuringUnit})`}>
            <input className="input h-12 font-bold text-emerald-700" type="number" min="1" max={acceptModal.sub?.quantitySent}
              value={acceptQty} onChange={e => setAcceptQty(e.target.value)} required />
          </FormField>

          <div className="flex gap-4">
            <button type="button" onClick={() => setAcceptModal({ open: false, sub: null })} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 h-12 rounded-xl flex-1">Abort</button>
            <button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 h-12 rounded-xl flex-[2] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
              {saving ? <Spinner size="sm" /> : <Package size={18} />}
              Accept and Restock
            </button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal (Confirmation) */}
      <Modal open={paymentModal.open} onClose={() => setPaymentModal({ open: false, sub: null })} title="Payment Authorization" size="sm">
         <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
               <IndianRupee size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">LKR {paymentModal.sub?.totalPrice.toLocaleString()}</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
               You are about to authorize a payout to <span className="font-bold text-emerald-700">{paymentModal.sub?.supplier?.businessName}</span> using Stripe.
            </p>
            <div className="space-y-3">
               <button onClick={handlePayment} disabled={saving} className="w-full h-14 bg-[#635bff] hover:bg-[#534bb3] text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95">
                  {saving ? <Spinner size="sm" color="white" /> : <CreditCard size={20} />}
                  Checkout with Stripe
               </button>
               <button onClick={() => setPaymentModal({ open: false, sub: null })} className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors py-2">
                  Go Back
               </button>
            </div>
         </div>
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectModal.open} onClose={() => setRejectModal({ open: false, sub: null })} title="Decline Submission" size="md">
        <form onSubmit={handleReject} className="p-8 space-y-6">
          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3 items-start">
             <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" />
             <p className="text-xs text-red-800 font-medium leading-relaxed">
                Declining this submission will revert the items to the supplier's private inventory and notify them of the rejection.
             </p>
          </div>
          <FormField label="Rejection Note / Feedback">
            <textarea className="input min-h-[120px] py-4 resize-none" value={rejectNote}
              onChange={e => setRejectNote(e.target.value)} placeholder="Please explain why the submission was declined..." />
          </FormField>
          <div className="flex gap-4">
            <button type="button" onClick={() => setRejectModal({ open: false, sub: null })} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 h-12 rounded-xl flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 h-12 rounded-xl flex-[2] transition-all active:scale-95">
              {saving ? <Spinner size="sm" /> : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Sync Modal */}
      <Modal open={syncModal.open} onClose={() => setSyncModal({ open: false, sub: null })} title="Go Live on Storefront" size="md">
        <form onSubmit={handleSync} className="p-8 space-y-6">
           <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-blue-200 shadow-sm text-blue-600">
                 <TrendingUp size={24} />
              </div>
              <div>
                 <p className="text-xs font-black text-blue-800 uppercase tracking-widest">Marketplace Sync</p>
                 <p className="text-[10px] text-blue-600">Configure your selling price and margin before syncing.</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Cost Price (LKR)</p>
                 <p className="text-lg font-black text-slate-800">{syncModal.sub?.unitPrice}</p>
              </div>
              <FormField label="Public Selling Price (LKR)">
                 <input className="input h-14 font-black text-emerald-700 text-lg" type="number" step="0.01" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} required />
              </FormField>
           </div>

           <div className="p-4 bg-emerald-990 rounded-2xl bg-emerald-900 shadow-xl">
              <div className="flex justify-between items-center text-white">
                 <p className="text-xs font-bold text-emerald-400">Estimated Profit / Unit</p>
                 <p className="text-xl font-black">LKR {(Number(sellingPrice) - (syncModal.sub?.unitPrice || 0)).toFixed(2)}</p>
              </div>
           </div>

           <div className="flex gap-4">
              <button type="button" onClick={() => setSyncModal({ open: false, sub: null })} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 h-12 rounded-xl flex-1">Later</button>
              <button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 h-12 rounded-xl flex-[2] shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95">
                 {saving ? <Spinner size="sm" /> : <Globe size={18} />}
                 Sync & Publish
              </button>
           </div>
        </form>
      </Modal>
    </Layout>
  )
}
