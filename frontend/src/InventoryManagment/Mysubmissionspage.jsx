import { useState, useEffect } from 'react'
import { grocerySubmissionsAPI } from '../api/index'
import Layout from '../components/layout/Layout'
import { Spinner, EmptyState } from '../components/common/index'
import { 
  ClipboardList, ImageOff, Clock, CheckCircle2, 
  XCircle, Receipt, Search, Filter, 
  Calendar, ArrowRight, Info, AlertCircle,
  CreditCard, ExternalLink
} from 'lucide-react'
import React from 'react'

const STATUS_STYLES = {
  pending:  { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Under Review' },
  accepted: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: 'Rejected' },
  paid:     { icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Payment Sent' },
}

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await grocerySubmissionsAPI.getMy()
      setSubmissions(res.data.data)
    } finally { setLoading(false) }
  }

  const filtered = submissions.filter(s => {
    const matchesSearch = s.groceryItem?.name?.toLowerCase().includes(search.toLowerCase())
    const matchesTab = activeTab === 'All' || 
                      (activeTab === 'Paid' ? s.isPaid : s.status === activeTab.toLowerCase())
    return matchesSearch && matchesTab
  })

  return (
    <Layout title="Supply History" subtitle="Monitor your inventory submissions and payments">
      <div className="max-w-[1200px] mx-auto px-6 pt-4 pb-20">
        
        {/* Header Stats & Search */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-10">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
               <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 w-full md:w-auto overflow-x-auto no-scrollbar">
                  {['All', 'Pending', 'Accepted', 'Rejected', 'Paid'].map(tab => (
                     <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                          activeTab === tab ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/10' : 'text-slate-400 hover:text-slate-600'
                        }`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>
               <button 
                  onClick={() => window.location.href = '/my-transactions'}
                  className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all w-full sm:w-auto justify-center"
               >
                  <CreditCard size={14} /> My Earnings
               </button>
            </div>

           <div className="relative group w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Find submission..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-11 h-11 bg-white border-slate-200 focus:ring-0"
              />
           </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
             <div className="w-10 h-10 border-4 border-emerald-900 border-t-transparent rounded-full animate-spin" />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Retrieving History...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card py-24 border-dashed border-2 flex flex-col items-center bg-white/50">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <ClipboardList size={40} className="text-slate-300" />
             </div>
             <h3 className="text-xl font-bold text-slate-800">No submissions found</h3>
             <p className="text-sm text-slate-500 mt-2">Try changing your filters or check back later.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map(sub => {
              const currentStatus = sub.isPaid ? 'paid' : sub.status
              const style = STATUS_STYLES[currentStatus] || STATUS_STYLES.pending
              const Icon = style.icon
              
              return (
                <div 
                  key={sub._id} 
                  className="card group hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 bg-white border border-slate-100 overflow-hidden flex flex-col md:flex-row items-stretch"
                >
                  {/* Status Indicator Bar */}
                  <div className={`w-1.5 flex-shrink-0 ${style.bg.replace('bg-', 'bg-')}`}>
                    <div className={`h-full w-full ${style.color.replace('text-', 'bg-')} opacity-80`}></div>
                  </div>

                  {/* Main Content */}
                  <div className="p-6 flex-1 flex flex-col md:flex-row gap-6">
                    {/* Media Preview */}
                    <div className="w-full md:w-32 h-32 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 relative group/img">
                      {sub.groceryItem?.image ? (
                        <img src={sub.groceryItem.image} alt="" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                          <ImageOff size={24} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                         <ExternalLink size={16} className="text-white" />
                      </div>
                    </div>

                    {/* Detailed Info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                           <div className="min-w-0">
                              <h4 className="text-lg font-bold text-slate-800 truncate mb-0.5">{sub.groceryItem?.name}</h4>
                              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                 <Calendar size={12} />
                                 <span>{new Date(sub.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                 <span className="opacity-30">•</span>
                                 <span>{sub.groceryItem?.groceryType}</span>
                              </div>
                           </div>
                           <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border-2 ${style.bg} ${style.border} ${style.color}`}>
                              <Icon size={14} className={sub.status === 'pending' ? 'animate-pulse' : ''} />
                              <span className="text-xs font-black uppercase tracking-wider">{style.label}</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                           <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                              <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Supplied</p>
                              <p className="text-sm font-black text-slate-700">{sub.quantitySent} <span className="text-[10px] text-slate-400">{sub.groceryItem?.measuringUnit}</span></p>
                           </div>
                           <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                              <p className="text-[10px] uppercase font-black text-emerald-600/60 mb-1">Unit Price</p>
                              <p className="text-sm font-black text-emerald-900">LKR {sub.unitPrice}</p>
                           </div>
                           <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                              <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Discount</p>
                              <p className="text-sm font-black text-slate-700">{sub.discountPercent}%</p>
                           </div>
                           <div className="bg-emerald-900 p-3 rounded-xl shadow-lg shadow-emerald-900/10">
                              <p className="text-[10px] uppercase font-black text-emerald-400 mb-1">Total Payout</p>
                              <p className="text-sm font-black text-white">LKR {sub.totalPrice.toLocaleString()}</p>
                           </div>
                        </div>
                      </div>

                      {/* Admin Note Section */}
                      {sub.reviewNote && (
                        <div className="mt-4 flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                           <Info size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                           <div className="text-xs text-slate-500 leading-relaxed italic">
                              <span className="font-bold text-slate-600 not-italic">Admin Review: </span> 
                              "{sub.reviewNote}"
                           </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Secondary Sidebar Action/Details */}
                  <div className="w-full md:w-64 bg-slate-50/50 p-6 flex flex-col justify-center border-l border-slate-100 md:items-end">
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Inventory Status</p>
                        {sub.status === 'accepted' ? (
                          <div className="flex flex-col gap-2 md:items-end">
                             {sub.isPaid ? (
                               <div className="flex items-center gap-2 text-purple-600 bg-purple-50 px-3 py-2 rounded-xl border border-purple-100 font-bold text-xs">
                                  <Receipt size={14} /> Settlement Complete
                               </div>
                             ) : (
                               <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 font-bold text-xs ring-2 ring-white ring-offset-2">
                                  <ArrowRight size={14} className="animate-pulse" /> Pending Settlement
                               </div>
                             )}
                          </div>
                        ) : sub.status === 'rejected' ? (
                          <div className="flex items-center gap-2 text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-100 font-bold text-xs">
                             <AlertCircle size={14} /> Contact Admin
                          </div>
                        ) : (
                          <div className="text-xs font-bold text-slate-400 flex items-center justify-end gap-2 px-3 py-2">
                             <Clock size={14} /> Processing Order...
                          </div>
                        )}
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