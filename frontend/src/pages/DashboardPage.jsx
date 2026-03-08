import { useState, useEffect } from 'react'
import { usersAPI, rolesAPI } from '../api/index.js'
import { Users, ShieldCheck, LayoutGrid, Activity } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { PageLoader } from '../components/common'
import { useAuth } from '../context/AuthContext.jsx'
import React from 'react'

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <div className="text-2xl font-display font-bold text-slate-800">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  </div>
)

export default function DashboardPage() {
  const { user, sidebar } = useAuth()
  const [stats, setStats] = useState({ users: 0, roles: 0, modules: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [u, r] = await Promise.all([usersAPI.getAll(), rolesAPI.getAll()])
        const moduleCount = sidebar.reduce((acc, pm) => acc + pm.menus.reduce((a, m) => a + m.screens.length, 0), 0)
        setStats({ users: u.data.count, roles: r.data.count, modules: moduleCount })
      } finally { setLoading(false) }
    }
    fetchStats()
  }, [sidebar])

  if (loading) return <Layout title="Dashboard"><PageLoader /></Layout>

  return (
    <Layout title="Dashboard" subtitle={`Welcome back, ${user?.firstName}`}>
      {user?.isAdmin && 
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard icon={Users} label="System Users" value={stats.users} color="bg-primary-600" />
        <StatCard icon={ShieldCheck} label="Roles Configured" value={stats.roles} color="bg-emerald-600" />
        <StatCard icon={LayoutGrid} label="Accessible Screens" value={stats.modules} color="bg-violet-600" />
      </div>
      }

    {user?.isAdmin &&
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Activity size={18} className="text-primary-600" />
          <h3 className="font-display font-bold text-slate-800">Your Access Overview</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sidebar.map(pm => (
            <div key={pm.code} className="border border-slate-200 rounded-xl p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-all">
              <div className="font-semibold text-sm text-slate-700 mb-2">{pm.name}</div>
              <div className="space-y-1">
                {pm.menus.map(menu => (
                  menu.screens.map(screen => (
                    <div key={screen.code} className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-primary-400" />
                      {screen.name}
                    </div>
                  ))
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
}
    </Layout>
  )
}