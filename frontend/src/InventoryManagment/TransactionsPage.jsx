import { useState, useEffect } from 'react'
import { paymentsAPI } from '../api/index'
import Layout from '../components/layout/Layout'
import { PageLoader, EmptyState } from '../components/common/index'
import {
   CreditCard, Search, Calendar, Download,
   ArrowUpRight, ArrowDownLeft, FileText,
   Table as TableIcon, Filter, ExternalLink,
   ChevronRight, IndianRupee, Receipt, CheckCircle2,
   TrendingUp
} from 'lucide-react'
import React from 'react'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

export default function TransactionsPage() {
   const { user, isSupplier } = useAuth()
   const [transactions, setTransactions] = useState([])
   const [loading, setLoading] = useState(true)
   const [search, setSearch] = useState('')
   const [dateRange, setDateRange] = useState({ start: '', end: '' })
   const [aggregates, setAggregates] = useState({ totalPaid: 0, totalReceived: 0, totalProfit: 0 })

   useEffect(() => { load() }, [])

   const load = async () => {
      setLoading(true)
      try {
         const res = isSupplier
            ? await paymentsAPI.getMyTransactions()
            : await paymentsAPI.getAllTransactions()

         setTransactions(res.data.data || [])
         setAggregates(res.data.aggregates || {})
      } finally { setLoading(false) }
   }

   const filtered = transactions.filter(t => {
      const itemName = t.groceryItem?.name?.toLowerCase() || ''
      const supplierName = t.supplier?.businessName?.toLowerCase() || ''
      const matchesSearch = itemName.includes(search.toLowerCase()) || supplierName.includes(search.toLowerCase())

      // Date filtering simple check
      if (!dateRange.start && !dateRange.end) return matchesSearch
      const tDate = new Date(t.createdAt).getTime()
      const sDate = dateRange.start ? new Date(dateRange.start).getTime() : 0
      const eDate = dateRange.end ? new Date(dateRange.end).getTime() + 86400000 : Infinity
      return matchesSearch && tDate >= sDate && tDate <= eDate
   })

   const exportPDF = () => {
      const doc = jsPDF({ orientation: 'landscape' })
      const title = isSupplier ? 'Earnings Statement' : 'Settlement History'

      doc.setFontSize(22)
      doc.setTextColor(5, 71, 40) // Dark Green
      doc.text(title, 14, 20)

      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28)
      doc.text(`User: ${user?.businessName || user?.username}`, 14, 33)

      const tableData = filtered.map(t => [
         new Date(t.createdAt).toLocaleDateString(),
         isSupplier ? 'Revenue' : 'Payout',
         t.groceryItem?.name || '--',
         isSupplier ? 'Admin' : (t.supplier?.businessName || '--'),
         `LKR ${t.amount.toLocaleString()}`,
         t.paymentStatus.toUpperCase()
      ])

      doc.autoTable({
         startY: 40,
         head: [['Date', 'Type', 'Product', isSupplier ? 'From' : 'To Supplier', 'Amount', 'Status']],
         body: tableData,
         headStyles: { fillStyle: [5, 71, 40], textColor: [255, 255, 255], fontStyle: 'bold' },
         alternateRowStyles: { fillStyle: [248, 252, 248] },
         margin: { top: 40 }
      })

      doc.save(`${title.replace(' ', '_')}_${new Date().getTime()}.pdf`)
      toast.success('PDF Report exported successfully')
   }

   const exportExcel = () => {
      const data = filtered.map(t => ({
         Date: new Date(t.createdAt).toLocaleString(),
         Item: t.groceryItem?.name,
         Type: isSupplier ? 'Revenue' : 'Payout',
         [isSupplier ? 'Source' : 'Recipient']: isSupplier ? 'System Admin' : t.supplier?.businessName,
         Amount: t.amount,
         Status: t.paymentStatus,
         StripeSessionId: t.stripePaymentIntentId
      }))

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Transactions")
      XLSX.writeFile(wb, `Transactions_${new Date().getTime()}.xlsx`)
      toast.success('Excel Statement exported successfully')
   }

   if (loading) return <Layout title="Transactions"><PageLoader /></Layout>

   return (
      <Layout title="Settlement History" subtitle="Monitor payouts, earnings, and financial trail">
         <div className="max-w-[1240px] mx-auto px-6 pt-6 pb-20">

            {/* Top Summary Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
               <div className="bg-emerald-900 rounded-[2rem] p-8 shadow-2xl shadow-emerald-900/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                     <CreditCard size={120} />
                  </div>
                  <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-1">
                     {isSupplier ? 'Total Revenue Earned' : 'Total Supplier Payouts'}
                  </p>
                  <h3 className="text-3xl font-black text-white flex items-center gap-2">
                     <span className="text-emerald-500">LKR</span>
                     {(isSupplier ? aggregates.totalReceived : aggregates.totalPaid)?.toLocaleString()}
                  </h3>
                  <div className="mt-6 flex items-center gap-2 text-emerald-400 text-[10px] font-bold bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/10">
                     <ArrowUpRight size={14} /> System Verified
                  </div>
               </div>

               <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover:text-emerald-50 transition-colors">
                     <Receipt size={100} />
                  </div>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Transaction Volume</p>
                  <h3 className="text-3xl font-black text-slate-800">{transactions.length} <span className="text-xs text-slate-400">Total Records</span></h3>
                  <div className="mt-6 flex items-center gap-2 text-slate-400 text-[10px] font-bold bg-slate-50 w-fit px-3 py-1.5 rounded-full border border-slate-100">
                     <Calendar size={14} /> Active Period
                  </div>
               </div>

               {!isSupplier && (
                  <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative group overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 text-emerald-50/50">
                        <TrendingUpIcon size={100} />
                     </div>
                     <p className="text-emerald-600 text-xs font-black uppercase tracking-widest mb-1">Projected Gross Profit</p>
                     <h3 className="text-3xl font-black text-emerald-900 flex items-center gap-2">
                        <span className="text-emerald-600/30">LKR</span>
                        {(aggregates.totalProfit || 0).toLocaleString()}
                     </h3>
                     <div className="mt-6 flex items-center gap-2 text-emerald-600 text-[10px] font-bold bg-emerald-50 w-fit px-3 py-1.5 rounded-full border border-emerald-100">
                        <ArrowUpRight size={14} /> Margin Realized
                     </div>
                  </div>
               )}
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
               <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                  <div className="relative w-full sm:w-80 group">
                     <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={16} />
                     <input
                        type="text"
                        placeholder="Filter by item or supplier..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="input pl-11 h-11 border-slate-200 focus:bg-emerald-50/10"
                     />
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 w-full sm:w-auto">
                     <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))} className="bg-transparent text-[10px] font-bold text-slate-600 outline-none p-1" />
                     <span className="text-slate-300">/</span>
                     <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))} className="bg-transparent text-[10px] font-bold text-slate-600 outline-none p-1" />
                  </div>
               </div>

               <div className="flex items-center gap-3 w-full lg:w-auto">
                  <button onClick={exportPDF} className="flex-1 lg:flex-none h-11 px-5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                     <FileText size={16} /> Export PDF
                  </button>
                  <button onClick={exportExcel} className="flex-1 lg:flex-none h-11 px-5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                     <TableIcon size={16} /> Export CSV
                  </button>
                  <button onClick={load} className="h-11 w-11 bg-emerald-990 bg-emerald-900 text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                     <Filter size={18} />
                  </button>
               </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-widest">Date & Identity</th>
                        <th className="px-6 py-5 text-[10px] uppercase font-black text-slate-400 tracking-widest">Particulars</th>
                        <th className="px-6 py-5 text-[10px] uppercase font-black text-slate-400 tracking-widest text-right">Amount</th>
                        <th className="px-6 py-5 text-[10px] uppercase font-black text-slate-400 tracking-widest text-center">Settlement Status</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-widest text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filtered.map((t, idx) => (
                        <tr key={t._id} className="hover:bg-slate-50/30 transition-colors group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isSupplier ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'} border border-transparent group-hover:border-current/10 transition-all`}>
                                    {isSupplier ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-slate-800">{new Date(t.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: TX-{t._id.slice(-6).toUpperCase()}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-6 font-medium">
                              <div className="flex flex-col">
                                 <span className="text-sm font-black text-slate-700">{t.groceryItem?.name || 'Supply Payout'}</span>
                                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    {isSupplier ? 'Received from Store' : `Sent to ${t.supplier?.businessName}`}
                                 </span>
                              </div>
                           </td>
                           <td className="px-6 py-6 text-right">
                              <p className={`text-base font-black ${isSupplier ? 'text-emerald-600' : 'text-slate-800'}`}>
                                 {isSupplier ? '+' : '-'} LKR {t.amount.toLocaleString()}
                              </p>
                           </td>
                           <td className="px-6 py-6 text-center">
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                                 <CheckCircle2 size={12} />
                                 {t.paymentStatus}
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <button className="p-2 text-slate-300 hover:text-emerald-600 transition-colors">
                                 <ExternalLink size={18} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {filtered.length === 0 && (
                  <div className="py-24 flex flex-col items-center opacity-40">
                     <Receipt size={64} className="mb-4" />
                     <p className="font-bold text-sm uppercase tracking-widest">No matching records found</p>
                  </div>
               )}
            </div>
         </div>
      </Layout>
   )
}

function TrendingUpIcon({ size = 20, className = "" }) {
   return <TrendingUp size={size} className={className} />
}
