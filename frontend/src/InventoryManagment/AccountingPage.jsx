import { useState, useEffect } from 'react'
import { paymentsAPI } from '../api/index'
import Layout from '../components/layout/Layout'
import { PageLoader, Spinner } from '../components/common/index'
import { 
  TrendingUp, BarChart3, PieChart as PieChartIcon, 
  Calendar, RefreshCw, Layers, DollarSign,
  ArrowUpRight, ArrowDownRight, Package, Users
} from 'lucide-react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Cell, Pie, Legend
} from 'recharts'
import React from 'react'
import { toast } from 'sonner'

const COLORS = ['#054728', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AccountingPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => { load() }, [period])

  const load = async () => {
    setLoading(true)
    try {
      const res = await paymentsAPI.getAnalytics({ period })
      setData(res.data.data)
    } finally { setLoading(false) }
  }

  if (loading || !data) return <Layout title="Accounting"><PageLoader /></Layout>

  const { overallStats, monthlyRevenue, supplierRevenue, categoryRevenue, profitTrend } = data

  return (
    <Layout title="Financial Intelligence" subtitle="System-wide revenue, margins and growth analytics">
      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-10">
        
        {/* Period Selector */}
        <div className="flex justify-between items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-100 mb-8">
           <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100">
              {['7', '30', '90', '365'].map(p => (
                 <button key={p} onClick={() => setPeriod(p)}
                   className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${
                     period === p ? 'bg-emerald-990 bg-emerald-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                   }`}>
                   Last {p} Days
                 </button>
              ))}
           </div>
           <button onClick={load} className="p-3 bg-white text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl border border-slate-100 transition-all">
              <RefreshCw size={20} className="hover:rotate-180 transition-transform duration-700" />
           </button>
        </div>

        {/* Global KPI Stack */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <KPICard title="Gross Payouts" value={overallStats.totalPaid} icon={<Layers />} color="emerald" sub="Total liquidity flow" />
           <KPICard title="Realized Profit" value={overallStats.totalProfit} icon={<TrendingUp />} color="blue" sub="Net system margin" trend="+12.5%" />
           <KPICard title="Total Settlements" value={overallStats.totalTransactions} icon={<Package />} color="amber" sub="Verified submissions" isCurrency={false} />
           <KPICard title="Avg. Settlement" value={overallStats.avgTransaction} icon={<DollarSign />} color="indigo" sub="Mean payout per batch" />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Revenue & Profit Area Chart */}
           <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-xl font-black text-slate-800">Financial Growth Trend</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">LKR Revenue vs Realized Profit</p>
                 </div>
                 <BarChart3 className="text-emerald-900/10" size={48} />
              </div>
              <div className="h-[400px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={profitTrend}>
                       <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#054728" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#054728" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                       <Tooltip content={<CustomTooltip />} />
                       <Area type="monotone" dataKey="revenue" stroke="#054728" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                       <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProf)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Category Distribution */}
           <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 flex flex-col">
              <div className="mb-8">
                 <h3 className="text-xl font-black text-slate-800">Supply Distribution</h3>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Dominant Categories</p>
              </div>
              <div className="flex-1 min-h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={categoryRevenue} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="count" nameKey="_id" >
                          {categoryRevenue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                       </Pie>
                       <Tooltip content={<CustomPieTooltip />} />
                       <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Supplier Performance Table (Simplified for view) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
           <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black text-slate-800">Top Revenue Partners</h3>
                 <Users className="text-blue-500/20" size={32} />
              </div>
              <div className="space-y-4">
                 {supplierRevenue.map((s, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                       <div className="w-10 h-10 bg-emerald-990 bg-emerald-900 text-white rounded-xl flex items-center justify-center font-black">
                          {i + 1}
                       </div>
                       <div className="flex-1">
                          <p className="text-sm font-black text-slate-800">{s.supplierName}</p>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                             <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${(s.totalPaid / supplierRevenue[0].totalPaid) * 100}%` }} />
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-slate-800">LKR {s.totalPaid.toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{s.transactions} Deals</p>
                       </div>
                    </div>
                 ))}
                 {supplierRevenue.length === 0 && <p className="text-center py-10 text-slate-400 italic">No partners to display yet.</p>}
              </div>
           </div>

           <div className="bg-emerald-990 bg-emerald-900 rounded-[2.5rem] shadow-2xl shadow-emerald-900/30 p-10 flex flex-col justify-center text-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-800/50 rounded-full blur-3xl opacity-50" />
              <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6 border border-white/10">
                    <RefreshCw className="text-emerald-400" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Live Intel</span>
                 </div>
                 <h2 className="text-4xl font-black mb-4 leading-tight">Projected Efficiency</h2>
                 <p className="text-emerald-400 text-sm font-bold opacity-80 leading-relaxed max-w-sm mb-8">
                    Your current markup strategy across all categories results in an average margin of <span className="text-white">~35%</span>. 
                    Consider adjusting inventory levels for high-turnover products.
                 </p>
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Total Synced Products</p>
                       <p className="text-3xl font-black">{data.syncedProductsCount}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Stock Portfolio Value</p>
                        <p className="text-3xl font-black"><span className="text-xs text-emerald-400">LKR</span> {((overallStats.totalPaid - overallStats.totalProfit) * 0.8).toLocaleString()}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  )
}

function KPICard({ title, value, icon, color, sub, trend, isCurrency = true }) {
   const colors = {
      emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-600', text: 'text-emerald-900' },
      blue: { bg: 'bg-blue-50', icon: 'bg-blue-600', text: 'text-blue-900' },
      amber: { bg: 'bg-amber-50', icon: 'bg-amber-600', text: 'text-amber-900' },
      indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-600', text: 'text-indigo-900' },
   }
   const c = colors[color]
   return (
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-all group">
         <div className="flex justify-between items-start">
            <div className={`w-12 h-12 ${c.icon} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
               {icon}
            </div>
            {trend && (
               <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1">
                  <ArrowUpRight size={12} /> {trend}
               </span>
            )}
         </div>
         <div className="mt-6">
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">{title}</p>
            <h4 className={`text-2xl font-black ${c.text}`}>
               {isCurrency && <span className="text-sm font-bold opacity-30 mr-1">LKR</span>}
               {value ? value.toLocaleString() : '0'}
            </h4>
            <p className="text-[10px] font-bold text-slate-400 mt-2">{sub}</p>
         </div>
      </div>
   )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-emerald-900 text-white p-4 rounded-2xl shadow-2xl border border-white/20">
        <p className="text-[10px] font-black uppercase text-emerald-400 mb-2">{label}</p>
        <div className="space-y-1">
           <div className="flex justify-between gap-6">
              <span className="text-xs font-bold text-white/50">Revenue</span>
              <span className="text-xs font-black">LKR {payload[0].value.toLocaleString()}</span>
           </div>
           <div className="flex justify-between gap-6 border-t border-white/5 pt-1 mt-1">
              <span className="text-xs font-bold text-white/50">Profit</span>
              <span className="text-xs font-black text-emerald-400">LKR {payload[1].value.toLocaleString()}</span>
           </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-100">
        <p className="text-xs font-black text-slate-800">{payload[0].name}</p>
        <p className="text-[10px] font-bold text-emerald-600">{payload[0].value} Items Listed</p>
      </div>
    )
  }
  return null;
}
