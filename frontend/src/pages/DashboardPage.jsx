import { useState, useEffect } from 'react'
import { usersAPI, rolesAPI } from '../api/index.js'
import { driverApi } from '../api/deliveryApi.js'
import { 
  Users, ShieldCheck, LayoutGrid, Activity, Truck, 
  MapPin, Clock, CheckCircle, TrendingUp, ShoppingBag,
  Navigation, AlertCircle, ChevronRight, UserCircle, Settings
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import { PageLoader, Badge } from '../components/common'
import { useAuth } from '../context/AuthContext.jsx'
import { Link } from 'react-router-dom'
import React from 'react'

const StatCard = ({ icon: Icon, label, value, color, description }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity ${color}`} />
    <div className="flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <div className="text-3xl font-display font-black text-slate-800 tracking-tight">{value}</div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
      </div>
    </div>
    {description && <p className="text-xs text-slate-400 mt-4 line-clamp-1">{description}</p>}
  </div>
)

export default function DashboardPage() {
  const { user, sidebar, isSupplier, isSuperAdmin, isDriver } = useAuth()
  const [stats, setStats] = useState({ users: 0, roles: 0, modules: 0, liveDrivers: 0, pendingTasks: 0 })
  const [loading, setLoading] = useState(true)

  const displayName = isSupplier
    ? (user?.contactPersonName || user?.businessName)
    : (user?.firstName || user?.username)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isSuperAdmin) {
          const [u, r, d] = await Promise.all([
            usersAPI.getAll(), 
            rolesAPI.getAll(),
            driverApi.getAll()
          ])
          const moduleCount = sidebar.reduce((acc, pm) => acc + pm.menus.reduce((a, m) => a + m.screens.length, 0), 0)
          setStats({ 
            users: u.data.count, 
            roles: r.data.count, 
            modules: moduleCount,
            liveDrivers: d.data?.filter(dr => dr.isAvailable)?.length || 0
          })
        } else if (isDriver) {
           const driverId = localStorage.getItem('fc_driver_id')
           if (driverId) {
             const [p, c] = await Promise.all([
               driverApi.getPendingAssignments(driverId),
               driverApi.getCurrentOrders(driverId)
             ])
             setStats(prev => ({ ...prev, pendingTasks: (p?.length || 0) + (c?.length || 0) }))
           }
        }
      } finally { setLoading(false) }
    }
    fetchStats()
  }, [sidebar, isSuperAdmin, isDriver])

  if (loading) return <Layout title="Dashboard"><PageLoader /></Layout>

  return (
    <Layout title="Dashboard" subtitle={`Refreshed: ${new Date().toLocaleTimeString()} • Welcome back, ${displayName}`}>
      
      {/* Welcome Hero - Premium Look */}
      <div className="relative bg-[#0d1f12] rounded-[3rem] p-10 mb-10 overflow-hidden shadow-2xl shadow-emerald-950/20">
         <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-emerald-500/20 to-transparent pointer-none" />
         <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-[100px]" />
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
               <Badge type="active" label={isSuperAdmin ? 'System Root Access' : isDriver ? 'Elite Driver Partner' : 'Certified Supplier'} className="mb-4 bg-emerald-500/20 text-emerald-400 border-none px-4 py-1.5" />
               <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-4 leading-tight">
                  The Pulse of Your <br/>
                  <span className="text-emerald-400">Grocery Operations</span>
               </h1>
               <p className="text-emerald-100/60 text-lg leading-relaxed mb-6">
                  {isSuperAdmin ? 'Real-time oversight across users, logistics, and inventory channels.' : 'Track your active shipments and maximize your daily route efficiency.'}
               </p>
               <div className="flex gap-4">
                  <Link to={isDriver ? '/driver/orders' : '/profile'} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-8 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                     {isDriver ? 'View Active Tasks' : 'Manage Account'}
                  </Link>
               </div>
            </div>
            <div className="w-32 h-32 md:w-48 md:h-48 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center backdrop-blur-md">
               {isSuperAdmin ? <Settings size={64} className="text-emerald-400/50" /> : <Truck size={64} className="text-emerald-400/50" />}
            </div>
         </div>
      </div>

      {/* Grid for Quick Stats */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard icon={Users} label="Total Staff" value={stats.users} color="bg-blue-600" description="Active system accounts" />
          <StatCard icon={ShieldCheck} label="Designated Roles" value={stats.roles} color="bg-emerald-600" description="Permissions & RBAC groups" />
          <StatCard icon={Truck} label="Live Riders" value={stats.liveDrivers} color="bg-amber-500" description="Drivers currently online" />
          <StatCard icon={LayoutGrid} label="Functionalities" value={stats.modules} color="bg-indigo-600" description="Registered system screens" />
        </div>
      )}

      {isDriver && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard icon={ShoppingBag} label="Active Deliveries" value={stats.pendingTasks} color="bg-emerald-600" description="Tasks requiring attention" />
          <StatCard icon={Navigation} label="Miles Driven" value="0.0 km" color="bg-blue-600" description="Calculated for today" />
          <StatCard icon={CheckCircle} label="Success Rate" value="100%" color="bg-teal-600" description="Completed on-time" />
        </div>
      )}

      {/* Access overview cards / Action tiles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
               <Activity size={16} className="text-emerald-500" /> Recent Activity
            </h4>
            
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-50 min-h-[300px] flex flex-col items-center justify-center text-slate-400 italic">
               <Clock size={48} className="mb-4 opacity-10" />
               <p className="text-sm">Activity logs will populate as system operations commence.</p>
            </div>
         </div>

         <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
               <AlertCircle size={16} className="text-amber-500" /> Quick Actions
            </h4>
            
            <div className="space-y-3">
               {(isSuperAdmin || isDriver) && (
                 <Link to={isSuperAdmin ? "/admin/users" : "/driver/dashboard"} className="block bg-white p-5 rounded-3xl border border-slate-50 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all group">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                            <UserCircle size={20} />
                          </div>
                          <div>
                             <div className="text-sm font-bold text-slate-800">{isSuperAdmin ? 'View All Users' : 'Update Real-time Location'}</div>
                             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{isSuperAdmin ? 'Manage Accounts' : 'Online / Offline Status'}</div>
                          </div>
                       </div>
                       <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                    </div>
                 </Link>
               )}

               {isSuperAdmin && (
                 <Link to="/suppliers" className="block bg-white p-5 rounded-3xl border border-slate-50 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all group">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                            <Truck size={20} />
                          </div>
                          <div>
                             <div className="text-sm font-bold text-slate-800">Supplier Oversight</div>
                             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Onboarding & Approval</div>
                          </div>
                       </div>
                       <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                    </div>
                 </Link>
               )}
            </div>
         </div>
      </div>

    </Layout>
  )
}