import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  ShoppingCart, Settings, Users, FileText, Package, Store,
  DollarSign, Truck, ChevronDown, ChevronRight, LogOut,
  LayoutDashboard, Tag, Layers, CreditCard, Box, ClipboardList,
  TrendingUp, ReceiptText, LayoutGrid
} from 'lucide-react'
import React from 'react'

const ICONS = {
  settings: Settings,
  users: Users,
  'file-text': FileText,
  receipt: ReceiptText,
  package: Package,
  'shopping-cart': ShoppingCart,
  'dollar-sign': DollarSign,
  truck: Truck,
  layout: LayoutGrid,
  'user-cog': Users,
  tag: Tag,
  clipboard: ClipboardList,
  'trending-up': TrendingUp,
  layers: Layers,
  store: Store,
  'credit-card': CreditCard,
  box: Box,
  default: FileText,
}

const Icon = ({ name, size = 18 }) => {
  const C = ICONS[name] || ICONS.default
  return <C size={size} />
}

const SidebarMenu = ({ menu }) => {
  const [open, setOpen] = useState(true)
  if (!menu.screens?.length) return null
  return (
    <div className="mb-1">
      {menu.screens.length > 1 && (
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-emerald-300/50 uppercase tracking-wider hover:text-emerald-200 transition-colors"
        >
          <span>{menu.name}</span>
          {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        </button>
      )}
      {(open || menu.screens.length === 1) && (
        <div>
          {menu.screens.map(screen => (
            <NavLink
              key={screen.code}
              to={screen.route}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 mx-1 ${
                  isActive
                    ? 'bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50 flex-shrink-0" />
              {screen.name}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  const { user, sidebar, logout } = useAuth()
  const navigate = useNavigate()
  const [activeParent, setActiveParent] = useState(null)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleParentClick = (code) => {
    setActiveParent(prev => prev === code ? null : code)
  }

  const activeSection = sidebar.find(s => s.code === activeParent)

  return (
    <div className="fixed left-0 top-0 bottom-0 z-40 flex">

      {/* Icon Rail */}
      <aside className="w-16 bg-[#0d1f12] flex flex-col items-center py-4 gap-1 border-r border-white/5">
        <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center mb-3 flex-shrink-0">
          <ShoppingCart size={18} className="text-white" />
        </div>

        <NavLink
          to="/dashboard"
          title="Dashboard"
          onClick={() => setActiveParent(null)}
          className={({ isActive }) =>
            `w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
              isActive && !activeParent
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                : 'text-slate-400 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <LayoutDashboard size={18} />
        </NavLink>

        <div className="w-6 h-px bg-white/10 my-1" />

        {sidebar.map(item => (
          <button
            key={item.code}
            title={item.name}
            onClick={() => handleParentClick(item.code)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
              activeParent === item.code
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                : 'text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon name={item.icon} size={18} />
          </button>
        ))}

        <div className="flex-1" />
        <div className="w-6 h-px bg-white/10 mb-2" />

        <button
          onClick={handleLogout}
          title="Sign Out"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
        >
          <LogOut size={18} />
        </button>

        <div
          title={`${user?.firstName} ${user?.lastName}`}
          className="w-9 h-9 bg-emerald-800 rounded-full flex items-center justify-center mt-1 flex-shrink-0"
        >
          <span className="text-white text-xs font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </span>
        </div>
      </aside>

      {/* Expanded Panel */}
      {activeParent && activeSection && (
        <div className="w-52 bg-[#112318] border-r border-white/5 flex flex-col">
          <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              {activeSection.name}
            </span>
            <button onClick={() => setActiveParent(null)} className="text-slate-500 hover:text-slate-300 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>

          <nav className="flex-1 py-3 px-2">
            {activeSection.menus?.map(menu => (
              <SidebarMenu key={menu.code} menu={menu} />
            ))}
          </nav>

          <div className="px-4 py-3 border-t border-white/10 flex-shrink-0">
            <div className="text-xs font-semibold text-white truncate">{user?.firstName} {user?.lastName}</div>
            <div className="text-xs text-emerald-400/60 truncate">{user?.role?.name}</div>
          </div>
        </div>
      )}
    </div>
  )
}