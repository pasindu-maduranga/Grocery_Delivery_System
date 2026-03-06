import { useState } from 'react'
import { Search, ChevronDown,
  Settings, Users, FileText, Package, Store, DollarSign, Truck,
  LayoutGrid, Tag, Layers, CreditCard, Box, ClipboardList,
  TrendingUp, ReceiptText, ShoppingCart, UserCog, Boxes,
  BarChart2, Bell, BookOpen, Building, Calendar, Cloud, Code,
  Database, Edit, Eye, Filter, Folder, Globe, Heart, Home,
  Key, List, Lock, Mail, Map, Monitor, PieChart, Printer,
  RefreshCw, Search as SearchIcon, Shield, Sliders, Star, Table2,
  Target, Upload, User, Wallet, Zap, Archive, Award, Briefcase,
  Clipboard, Clock, Coffee, Compass, Cpu, Flag, Gift, Grid,
  Image, Info, Leaf, MessageSquare, Navigation, Package2,
  Phone, Play, Power, Save, Send, Share, ShoppingBag,
  Smile, Terminal, Wrench, Video, Wifi, Wind
} from 'lucide-react'
import React from 'react'

export const ICON_MAP = {
  'settings': Settings, 'users': Users, 'file-text': FileText,
  'package': Package, 'store': Store, 'dollar-sign': DollarSign,
  'truck': Truck, 'layout-grid': LayoutGrid, 'tag': Tag,
  'layers': Layers, 'credit-card': CreditCard, 'box': Box,
  'clipboard-list': ClipboardList, 'trending-up': TrendingUp,
  'receipt': ReceiptText, 'shopping-cart': ShoppingCart,
  'user-cog': UserCog, 'boxes': Boxes, 'bar-chart': BarChart2,
  'bell': Bell, 'book-open': BookOpen, 'building': Building,
  'calendar': Calendar, 'cloud': Cloud, 'code': Code,
  'database': Database, 'edit': Edit, 'eye': Eye,
  'filter': Filter, 'folder': Folder, 'globe': Globe,
  'heart': Heart, 'home': Home, 'key': Key, 'list': List,
  'lock': Lock, 'mail': Mail, 'map': Map, 'monitor': Monitor,
  'pie-chart': PieChart, 'printer': Printer, 'refresh': RefreshCw,
  'search': SearchIcon, 'shield': Shield, 'sliders': Sliders,
  'star': Star, 'table': Table2, 'target': Target,
  'upload': Upload, 'user': User, 'wallet': Wallet, 'zap': Zap,
  'archive': Archive, 'award': Award, 'briefcase': Briefcase,
  'clipboard': Clipboard, 'clock': Clock, 'coffee': Coffee,
  'compass': Compass, 'cpu': Cpu, 'flag': Flag, 'gift': Gift,
  'grid': Grid, 'image': Image, 'info': Info, 'leaf': Leaf,
  'message': MessageSquare, 'navigation': Navigation,
  'package2': Package2, 'phone': Phone, 'play': Play,
  'power': Power, 'save': Save, 'send': Send, 'share': Share,
  'shopping-bag': ShoppingBag, 'smile': Smile, 'terminal': Terminal,
  'tool': Wrench, 'video': Video, 'wifi': Wifi, 'wind': Wind,
}

export const getIcon = (name) => ICON_MAP[name] || Settings

const ALL_ICONS = Object.keys(ICON_MAP)

export default function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = ALL_ICONS.filter(n => n.includes(search.toLowerCase()))
  const SelectedIcon = getIcon(value)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="input flex items-center gap-3 text-left cursor-pointer hover:border-emerald-400"
      >
        <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <SelectedIcon size={15} className="text-emerald-700" />
        </div>
        <span className="flex-1 text-sm font-mono text-slate-600">{value || 'Select icon...'}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setSearch('') }} />
          <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-2.5 border-b border-slate-100">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search icons..."
                  className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-9 gap-0.5 p-2 max-h-48 overflow-y-auto">
              {filtered.map(name => {
                const Ic = ICON_MAP[name]
                return (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    onClick={() => { onChange(name); setOpen(false); setSearch('') }}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all hover:bg-emerald-50 hover:text-emerald-700 ${
                      value === name ? 'bg-emerald-600 text-white shadow' : 'text-slate-500'
                    }`}
                  >
                    <Ic size={15} />
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <p className="col-span-9 text-center py-6 text-xs text-slate-400">No icons found</p>
              )}
            </div>
            <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 font-mono">
              {value ? `Selected: ${value}` : 'Click an icon to select'}
            </div>
          </div>
        </>
      )}
    </div>
  )
}