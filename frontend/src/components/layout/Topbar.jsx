import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import React from 'react'

export default function Topbar({ title, subtitle }) {
  const { user } = useAuth()
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h1 className="font-display text-lg font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-slate-700">{user?.firstName} {user?.lastName}</div>
            <div className="text-xs text-slate-400">{user?.role?.name}</div>
          </div>
        </div>
      </div>
    </header>
  )
}