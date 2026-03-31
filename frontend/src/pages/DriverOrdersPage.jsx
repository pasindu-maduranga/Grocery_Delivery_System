import { useState, useEffect } from 'react'
import { driverApi } from '../api/deliveryApi'
import Layout from '../components/layout/Layout'
import { Card, Spinner, Badge, Table, Modal, PageLoader } from '../components/common'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, MapPin, Clock, CheckCircle, XCircle, Navigation, ChevronRight, AlertCircle, Phone, CreditCard, DollarSign, Wallet, Store } from 'lucide-react'
import { toast } from 'sonner'
import React from 'react'

const STATUS_MAP = {
  'pending': { label: 'Assigned', type: 'inactive' },
  'accepted': { label: 'In Progress', type: 'active' },
  'picked_up': { label: 'Picked Up', type: 'active' },
  'delivered': { label: 'Completed', type: 'active' },
  'cancelled': { label: 'Cancelled', type: 'locked' }
}

const RIDER_COMMISSION_PERCENT = 0.8
const STORE_LOCATION_NAME = 'Borella Main Branch'

export default function DriverOrdersPage() {
  const navigate = useNavigate()
  const driverIdInternal = localStorage.getItem('fc_driver_id')
  
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState({ pending: [], active: [] })
  const [processing, setProcessing] = useState(false)
  const [driverStats, setDriverStats] = useState({ totalDeliveries: 0, balance: 0 })
  
  useEffect(() => {
    if (!driverIdInternal) {
      toast.error('Driver ID not found. Please log in again.')
      return
    }
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const [pRes, aRes] = await Promise.all([
        driverApi.getPendingAssignments(driverIdInternal),
        driverApi.getCurrentOrders(driverIdInternal)
      ])
      setOrders({ pending: pRes || [], active: aRes || [] })
      
      // Simulating stats for now - in production this would come from a driver stats API
      setDriverStats({ 
        totalDeliveries: (aRes?.length || 0) + 12, 
        balance: 4250.00 
      })
    } catch (err) {
      console.error(err)
      toast.error('Failed to sync orders')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (orderId) => {
    setProcessing(true)
    try {
      await driverApi.acceptOrder(driverIdInternal, orderId)
      toast.success('Task accepted! Report to Borella Main Branch.')
      fetchOrders()
    } catch (err) {
      toast.error(err.message || 'Acceptance failed')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (orderId) => {
    setProcessing(true)
    try {
      await driverApi.rejectOrder(driverIdInternal, orderId, 'Driver cannot fulfill at this time')
      toast.error('Task rejected')
      fetchOrders()
    } catch (err) {
      toast.error(err.message || 'Rejection failed')
    } finally {
      setProcessing(false)
    }
  }

  const calculateCommission = (totalAmount) => {
     // Commission based on the delivery fee - assuming LKR 250 fee is built in or based on distance
     const deliveryFee = 250 // Base fee
     return (deliveryFee * RIDER_COMMISSION_PERCENT).toFixed(2)
  }

  if (loading) return <Layout title="My Delivery Tasks"><PageLoader /></Layout>

  return (
    <Layout title="Shipment Dashboard" subtitle="Manage your active deliveries and earnings">
      <div className="space-y-8">
        
        {/* Earnings & Wallet Overview - Premium Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-8 bg-gradient-to-br from-[#0d1f12] to-emerald-950 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110" />
               
               <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div>
                     <div className="flex items-center gap-2 mb-4">
                        <Badge type="active" label="Pro Pilot Level 1" className="bg-emerald-500/10 text-emerald-400 border-none px-4" />
                        <span className="text-[10px] font-black tracking-widest text-emerald-100/30 uppercase italic">Commission: {(RIDER_COMMISSION_PERCENT*100)}%</span>
                     </div>
                     <span className="text-xs font-black text-emerald-100/40 uppercase tracking-widest">Available Balance</span>
                     <div className="text-5xl font-black text-white mt-1 mb-4 italic tracking-tight">LKR {driverStats.balance.toFixed(2)}</div>
                     <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black px-8 py-3 rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                        Withdraw Earnings
                     </button>
                  </div>
                  <div className="flex gap-4 md:gap-8">
                     <div className="text-center">
                        <div className="text-2xl font-black text-emerald-400">{driverStats.totalDeliveries}</div>
                        <div className="text-[10px] font-bold text-emerald-100/30 uppercase">Deliveries</div>
                     </div>
                     <div className="w-px h-12 bg-white/10" />
                     <div className="text-center">
                        <div className="text-2xl font-black text-emerald-400">4.9★</div>
                        <div className="text-[10px] font-bold text-emerald-100/30 uppercase">Rating</div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-white rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                     <Store size={24} />
                  </div>
                  <div>
                     <div className="text-sm font-black text-slate-800 italic uppercase tracking-tighter">Fleet HQ</div>
                     <div className="text-xs text-slate-400 font-medium">Borella Main Branch</div>
                  </div>
               </div>
               <div className="mt-8 pt-8 border-t border-slate-50">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pick up Notice</div>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                     "All pilots must report to the Borella HQ for dispatch. Ensure your thermal gear is active."
                  </p>
               </div>
            </div>
        </div>

        {/* New Assignments Table Style */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 shrink-0 px-2 italic">
               <AlertCircle size={16} className="text-amber-500" /> New Task Pings
            </h4>
            <div className="h-px flex-1 bg-slate-50 mx-6 hidden md:block" />
          </div>

          {orders.pending.length === 0 ? (
            <div className="bg-white border border-slate-50 rounded-[2.5rem] py-16 flex flex-col items-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4 animate-pulse">
                   <Clock size={32} />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Searching for assignments...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.pending.map(order => (
                <div key={order._id} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-50 hover:-translate-y-1 transition-transform relative group">
                  <div className="absolute top-6 right-8">
                     <Badge type="info" label="Pickup" className="bg-blue-50 text-blue-600 border-none" />
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Order Ref: {order._id.substring(-6)}</span>
                    <h5 className="font-black text-slate-800 text-lg mt-1 italic tracking-tight">{order.customerName || 'Anonymous Customer'}</h5>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                           <div className="text-[10px] font-black text-slate-400 uppercase">Drop Location</div>
                           <div className="text-xs text-slate-700 font-bold leading-relaxed">{order.shippingAddress?.address || 'Local Address'}</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Wallet size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                           <div className="text-[10px] font-black text-slate-400 uppercase">Your Pay (Est)</div>
                           <div className="text-sm font-black text-emerald-600 italic">LKR {calculateCommission(order.totalAmount)}</div>
                        </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button 
                      onClick={() => handleAccept(order._id)}
                      disabled={processing}
                      className="flex-1 bg-[#0d1f12] hover:bg-emerald-800 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-emerald-950/20"
                    >
                      {processing ? <Spinner size="sm" /> : 'Accept Task'}
                    </button>
                    <button 
                      onClick={() => handleReject(order._id)}
                      disabled={processing}
                      className="w-14 bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-500 py-4 rounded-2xl transition-all border border-transparent hover:border-red-100 flex items-center justify-center"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Grid View */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 shrink-0 px-2 italic">
               <Navigation size={16} className="text-emerald-500" /> Ground Operations
            </h4>
            <div className="h-px flex-1 bg-slate-50 mx-6 hidden md:block" />
          </div>
          
          {orders.active.length === 0 ? (
            <div className="bg-white border border-slate-50 rounded-[2.5rem] py-16 flex flex-col items-center justify-center text-slate-200">
               <ShoppingBag size={48} strokeWidth={1} />
               <p className="mt-4 font-black uppercase tracking-widest text-[10px]">No Active Cargo</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.active.map(order => (
                <div key={order._id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 flex flex-col md:flex-row md:items-center gap-8 group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                  
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <Truck size={32} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-black text-slate-800 italic uppercase">Tracking {order.customerName}</span>
                      <Badge type="active" label={order.status.replace('_', ' ')} className="px-4 py-1.5" />
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                       <span className="flex items-center gap-1.5"><MapPin size={12} className="text-emerald-500" /> {order.shippingAddress?.address?.slice(0, 30)}...</span>
                       <span className="flex items-center gap-1.5"><Clock size={12} className="text-emerald-500" /> 23m ETA</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 shrink-0 border-t md:border-t-0 md:border-l border-slate-50 pt-6 md:pt-0 md:pl-8">
                    <div className="text-right">
                       <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Earnings</div>
                       <div className="text-lg font-black text-emerald-600 italic">LKR {calculateCommission(order.totalAmount)}</div>
                    </div>
                    <button 
                      onClick={() => navigate(`/driver/dashboard`)}
                      className="w-14 h-14 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl transition-all shadow-lg shadow-slate-200 flex items-center justify-center active:scale-95"
                    >
                      <Navigation size={22} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </Layout>
  )
}

function Truck({ size, className }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-2.48-3.047A2 2 0 0 0 17.77 9H14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>;
}
