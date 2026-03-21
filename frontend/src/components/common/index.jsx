import { X, AlertTriangle, Loader2, InboxIcon } from 'lucide-react'
import React from 'react'

export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-display text-base font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

export const ConfirmModal = ({ open, onClose, onConfirm, title, message, loading }) => (
  <Modal open={open} onClose={onClose} title="Confirm Action" size="sm">
    <div className="p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={20} className="text-red-600" />
        </div>
        <div>
          <p className="font-semibold text-slate-800 mb-1">{title}</p>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="btn-danger">
          {loading ? <Spinner size="sm" /> : null}
          Confirm
        </button>
      </div>
    </div>
  </Modal>
)

export const Spinner = ({ size = 'md' }) => {
  const s = size === 'sm' ? 14 : size === 'lg' ? 32 : 20
  return <Loader2 size={s} className="animate-spin text-primary-600" />
}

export const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size="lg" />
  </div>
)

export const EmptyState = ({ message = 'No records found' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
    <InboxIcon size={40} strokeWidth={1} className="mb-3 opacity-40" />
    <p className="text-sm">{message}</p>
  </div>
)

export const Badge = ({ type = 'active', label }) => {
  const classes = { active: 'badge-active', inactive: 'badge-inactive', locked: 'badge-locked' }
  const dots = { active: 'bg-emerald-500', inactive: 'bg-slate-400', locked: 'bg-red-500' }
  return (
    <span className={classes[type]}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[type]}`} />
      {label}
    </span>
  )
}

export const FormField = ({ label, error, children }) => (
  <div>
    {label && <label className="label">{label}</label>}
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
)

export const Table = ({ headers, children, loading, empty }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr>
          {headers.map(h => <th key={h} className="table-header">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan={headers.length} className="py-16 text-center"><Spinner /></td></tr>
        ) : empty ? (
          <tr><td colSpan={headers.length}><EmptyState /></td></tr>
        ) : children}
      </tbody>
    </table>
  </div>
)

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h2 className="font-display text-xl font-bold text-slate-800">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
)