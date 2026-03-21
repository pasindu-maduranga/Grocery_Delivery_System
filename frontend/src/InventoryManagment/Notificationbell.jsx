import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationsAPI } from '../api/index'
import { useAuth } from '../context/AuthContext'
import { Bell, Package, CheckCircle2, XCircle, AlertTriangle, CreditCard, ChevronRight } from 'lucide-react'
import React from 'react'

const ICONS = {
  submission_received: { Icon: Package, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  submission_accepted: { Icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  submission_rejected: { Icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
  reorder_alert:       { Icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  payment_received:    { Icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
}

export default function NotificationBell() {
  const { isSuperAdmin, isSupplier } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadCount()
    const interval = setInterval(loadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadCount = async () => {
    try {
      const res = isSuperAdmin
        ? await notificationsAPI.getAdmin()
        : await notificationsAPI.getSupplier()
      setUnreadCount(res.data.unreadCount)
    } catch {}
  }

  const handleOpen = async () => {
    setOpen(o => !o)
    if (!open) {
      setLoading(true)
      try {
        const res = isSuperAdmin
          ? await notificationsAPI.getAdmin()
          : await notificationsAPI.getSupplier()
        setNotifications(res.data.data)
        setUnreadCount(res.data.unreadCount)
      } finally { setLoading(false) }
    }
  }

  const markRead = async (id) => {
    try {
      if (isSuperAdmin) await notificationsAPI.markAdminRead(id)
      else await notificationsAPI.markSupplierRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      if (isSuperAdmin) await notificationsAPI.markAdminRead('all')
      else await notificationsAPI.markSupplierRead('all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {}
  }

  const handleNotifClick = (notif) => {
    if (!notif.isRead) markRead(notif._id)
    if (notif.type === 'submission_received' || notif.type === 'reorder_alert') {
      if (isSuperAdmin) navigate('/grocery-submissions')
    } else if (notif.type === 'submission_accepted' || notif.type === 'submission_rejected') {
      navigate('/my-submissions')
    } else if (notif.type === 'payment_received') {
      navigate('/my-transactions')
    }
    setOpen(false)
  }

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleOpen}
        className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 shadow-sm border ${
          open ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-200 hover:text-emerald-600'
        }`}
      >
        <Bell size={18} className={unreadCount > 0 ? 'animate-bounce-subtle' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-in zoom-in border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden anim-fade-in-up">
          <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
              <p className="text-[10px] text-slate-500">Stay updated with latest activities</p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead} 
                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition-all"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-medium">Fetching notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Bell size={28} className="text-slate-200" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No notifications yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[160px] mx-auto">We'll let you know when something important happens.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map(notif => {
                  const info = ICONS[notif.type] || ICONS.submission_received
                  const Icon = info.Icon
                  return (
                    <div 
                      key={notif._id} 
                      onClick={() => handleNotifClick(notif)}
                      className={`group flex items-start gap-3.5 px-5 py-4 cursor-pointer hover:bg-emerald-50/30 transition-all duration-200 relative ${!notif.isRead ? 'bg-emerald-50/20' : ''}`}
                    >
                      {!notif.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500"></div>
                      )}
                      
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${info.bg} ${info.border} group-hover:scale-105 transition-transform shadow-sm`}>
                        <Icon size={18} className={info.color} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-bold truncate transition-colors ${!notif.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium">{timeAgo(notif.createdAt)}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>

                      <div className="self-center">
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-50 bg-slate-50/30 text-center">
             <button 
              onClick={() => { navigate(isSuperAdmin ? '/grocery-submissions' : '/my-submissions'); setOpen(false); }}
              className="text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
             >
               View all notifications
             </button>
          </div>
        </div>
      )}
    </div>
  )
}