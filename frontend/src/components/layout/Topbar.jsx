import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationsAPI } from '../../api/index'
import { useAuth } from '../../context/AuthContext'
import { Bell, Package, CheckCircle2, XCircle, AlertTriangle, ImageOff } from 'lucide-react'
import React from 'react'

const ICONS = {
  submission_received: { Icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
  submission_accepted: { Icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  submission_rejected: { Icon: XCircle, color: 'text-red-400', bg: 'bg-red-50' },
  reorder_alert:       { Icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
}

export default function NotificationBell() {
  const { isSuperAdmin, isSupplier, user } = useAuth()
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
    }
    setOpen(false)
  }

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 text-sm">Notifications</span>
              {unreadCount > 0 && <span className="ml-2 text-xs bg-red-100 text-red-600 font-medium px-1.5 py-0.5 rounded-full">{unreadCount} new</span>}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <Bell size={32} className="mx-auto mb-2 text-slate-200" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => {
                const iconInfo = ICONS[notif.type] || ICONS.submission_received
                const Icon = iconInfo.Icon
                return (
                  <div key={notif._id} onClick={() => handleNotifClick(notif)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${!notif.isRead ? 'bg-blue-50/40' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconInfo.bg}`}>
                      <Icon size={15} className={iconInfo.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800">{notif.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{timeAgo(notif.createdAt)}</div>
                    </div>
                    {!notif.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}