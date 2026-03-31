import { useState, useEffect } from 'react'
import { driverApi } from '../api/deliveryApi'
import axios from 'axios'
import { usersAPI, rolesAPI } from '../api/index'
import Layout from '../components/layout/Layout'
import { Table, Badge, ConfirmModal, PageLoader, Spinner, Modal, FormField } from '../components/common/index'
import { Truck, MapPin, User, Settings, AlertCircle, Plus, Eye, CheckCircle, XCircle, Search, Mail, Phone, ShoppingBag, Shield, Zap, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import React from 'react'

const SYSTEM_API = import.meta.env.VITE_SYSTEM_SERVICE_URL || 'http://localhost:5000/api'

export default function DriversPage() {
  const [loading, setLoading] = useState(true)
  const [drivers, setDrivers] = useState([])
  const [search, setSearch] = useState('')
  const [syncing, setSyncing] = useState(false)
  
  // Add rider modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [roles, setRoles] = useState([])
  const [form, setForm] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    username: '', 
    roleId: '',
    vehicleType: 'Motorcycle' 
  })

  useEffect(() => {
    fetchDrivers()
    fetchRoles()
  }, [])

  const fetchDrivers = async () => {
    try {
      const res = await driverApi.getAll()
      setDrivers(res.data || [])
    } catch (err) {
      toast.error('Failed to load riders')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
     try {
        const res = await rolesAPI.getAll()
        const rolesList = res.data.data || res.data // handle both axios and direct formats
        setRoles(rolesList.filter(r => r.name.toLowerCase().includes('driver') || r.name.toLowerCase().includes('delivery')))
     } catch (err) {
        toast.error('Failed to load rider roles')
     }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${SYSTEM_API}/system-users/sync-drivers`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Rider fleet sync complete!')
      fetchDrivers()
    } catch (err) {
      toast.error('Sync failed: ' + (err.response?.data?.message || err.message))
    } finally {
      setSyncing(false)
    }
  }

  const handleAddRider = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // Create user first
      await usersAPI.create(form)
      toast.success('Rider created and credentials emailed!')
      setShowAddModal(false)
      fetchDrivers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create rider')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = drivers.filter(d => 
    d.name?.toLowerCase().includes(search.toLowerCase()) || 
    d.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Layout title="Rider Management"><PageLoader /></Layout>

  return (
    <Layout 
      title="Fleet Control HUB" 
      subtitle={`${drivers.length} registered riders in the system`}
    >
      <div className="space-y-6">
        <div className="bg-red-650 text-white p-4 rounded-xl font-bold text-center">LOGISTICS HUB ACTIVE V2</div>
        
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={handleSync}
               disabled={syncing}
               className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all disabled:opacity-50"
             >
                {syncing ? <RefreshCw size={18} className="animate-spin" /> : <Zap size={18} />}
                {syncing ? 'Syncing...' : 'Sync with Fleet'}
             </button>
             <button 
               onClick={() => setShowAddModal(true)}
               className="flex items-center gap-2 bg-[#065f46] hover:bg-[#064e3b] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all"
             >
               <Plus size={18} /> Add Rider
             </button>
          </div>
        </div>

        {/* Riders Table */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-50 overflow-hidden">
          <Table 
            columns={[
              { 
                header: 'Rider Info', 
                render: (d) => (
                  <div className="flex items-center gap-4 py-2">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-lg">
                      {d.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-800 uppercase tracking-tighter">{d.name}</div>
                      <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Mail size={10} /> {d.email}
                      </div>
                    </div>
                  </div>
                )
              },
              { 
                header: 'Vehicle', 
                render: (d) => (
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-100">
                        <Truck size={18} />
                     </div>
                     <div>
                        <div className="text-[11px] font-black text-slate-800 uppercase">{d.vehicleType}</div>
                        <div className="text-[10px] text-slate-400 font-mono italic">{d.licensePlate || '1234'}</div>
                     </div>
                  </div>
                )
              },
              { 
                header: 'Status', 
                render: (d) => (
                  <Badge 
                    type={d.isActive ? 'active' : 'locked'} 
                    label={d.isActive ? 'Approved' : 'Suspended'} 
                    className="px-6 py-1.5"
                  />
                )
              },
              { 
                header: 'Availability', 
                render: (d) => (
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${d.isAvailable ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-300'}`} />
                     <span className={`text-[11px] font-black uppercase tracking-widest ${d.isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {d.isAvailable ? 'Online' : 'Offline'}
                     </span>
                  </div>
                )
              },
              {
                header: 'Ratings',
                render: (d) => (
                  <div className="flex flex-col">
                     <div className="flex items-center gap-1 group">
                        {[1,2,3,4,5].map(n => (
                          <span key={n} className={`text-sm ${n <= Math.round(d.rating?.average || 0) ? 'text-amber-400' : 'text-slate-100'}`}>★</span>
                        ))}
                        <span className="text-xs font-black text-slate-800 ml-1 italic">{d.rating?.average?.toFixed(1) || '0.0'}</span>
                     </div>
                  </div>
                )
              },
              { 
                header: 'Actions', 
                render: (d) => (
                  <div className="flex items-center gap-2">
                    <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all border border-slate-100">
                      <XCircle size={18} />
                    </button>
                    <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all border border-slate-100" title="View Location">
                      <MapPin size={18} />
                    </button>
                  </div>
                )
              }
            ]} 
            data={filtered} 
          />
        </div>

        {/* Add Rider Modal */}
        <Modal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)}
          title="Onboard New Fleet Pilot"
        >
          <form onSubmit={handleAddRider} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField 
                label="First Name" 
                value={form.firstName} 
                onChange={(v) => setForm({ ...form, firstName: v })} 
                required 
              />
              <FormField 
                label="Last Name" 
                value={form.lastName} 
                onChange={(v) => setForm({ ...form, lastName: v })} 
                required 
              />
            </div>
            <FormField 
              label="Email Address" 
              type="email"
              value={form.email} 
              onChange={(v) => setForm({ ...form, email: v })} 
              required 
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField 
                label="Username" 
                value={form.username} 
                onChange={(v) => setForm({ ...form, username: v })} 
                required 
              />
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Role</label>
                 <select 
                    value={form.roleId} 
                    onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                    required
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
                 >
                    <option value="">Select Role</option>
                    {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                 </select>
              </div>
            </div>
            
            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-[1.5rem] font-black text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className="flex-[2] py-4 bg-[#0d1f12] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-950/20 disabled:opacity-50"
              >
                {submitting ? 'Calibrating...' : 'Register Deployment'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}
