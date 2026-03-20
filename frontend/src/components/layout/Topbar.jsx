import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { 
  LogOut, Settings 
} from 'lucide-react'
import React from 'react'
import NotificationBell from '../../InventoryManagment/Notificationbell'

export default function Topbar({ title, subtitle }) {
  const { user, isSupplier, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const displayName = isSupplier
    ? (user?.contactPersonName || user?.businessName)
    : (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username)

  const userRole = isSupplier ? 'Supplier' : (user?.isSuperAdmin ? 'Super Admin' : user?.role?.name || 'System User')

  return (
    <header className={`sticky top-0 z-30 transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-[#f8faf8]'
    } px-8 h-20 flex items-center justify-between border-b border-emerald-50/50`}>
      
      {/* Left Aligned: Profile Info */}
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-emerald-900 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-900/10 border border-emerald-800">
            {displayName ? displayName[0].toUpperCase() : 'U'}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="flex flex-col">
          <h4 className="text-base font-black text-slate-800 leading-tight">
            {displayName || 'Guest User'}
          </h4>
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5 border border-emerald-100/50">
            {userRole}
          </span>
        </div>
      </div>

      {/* Right Aligned: Notifications & Logout */}
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
           <NotificationBell />
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all duration-200 group"
        >
          <span className="text-xs">Sign Out</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
            <LogOut size={18} />
          </div>
        </button>

        <div className="relative group">
           <button className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
              <Settings size={18} />
           </button>
        </div>
      </div>
    </header>
  )
}