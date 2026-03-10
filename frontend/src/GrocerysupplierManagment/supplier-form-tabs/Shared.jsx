import React from 'react'
import { Upload, X, FileText } from 'lucide-react'

export const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
      {label} {required && <span className="text-red-400 normal-case font-normal tracking-normal">*</span>}
    </label>
    {children}
  </div>
)

export const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-3 py-[10px] text-sm text-slate-800 bg-white border border-slate-200 rounded-sm
      placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500
      disabled:bg-slate-50 disabled:text-slate-400 transition-colors ${className}`}
    {...props}
  />
)

export const Select = ({ children, className = '', ...props }) => (
  <select
    className={`w-full px-3 py-[10px] text-sm text-slate-800 bg-white border border-slate-200 rounded-sm
      focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${className}`}
    {...props}
  >
    {children}
  </select>
)

export const FileUpload = ({ label, required, accept, preview, fileName, onChange, onClear }) => (
  <Field label={label} required={required}>
    {preview ? (
      <div className="relative border border-slate-200 rounded-sm overflow-hidden bg-slate-50">
        {preview.startsWith('data:image') || preview.match(/\.(jpg|jpeg|png|webp)/i) || preview.startsWith('http')
          ? <img src={preview} alt={label} className="w-full h-32 object-cover" />
          : (
            <div className="flex items-center gap-3 px-3 py-[10px]">
              <div className="w-8 h-8 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0">
                <FileText size={14} className="text-emerald-600" />
              </div>
              <span className="text-xs text-slate-600 truncate">{fileName || 'Document uploaded'}</span>
            </div>
          )
        }
        <button type="button" onClick={onClear}
          className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
          <X size={10} />
        </button>
      </div>
    ) : (
      <label className="flex items-center gap-3 px-3 py-[10px] border border-dashed border-slate-300 rounded-sm
        cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition-all group">
        <div className="w-8 h-8 bg-slate-100 group-hover:bg-emerald-100 rounded flex items-center justify-center flex-shrink-0 transition-colors">
          <Upload size={14} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-600">Click to upload</p>
          <p className="text-xs text-slate-400">{accept?.replace(/\./g, '').replace(/,/g, ', ').toUpperCase() || 'PNG, JPG, PDF'} · Max 5MB</p>
        </div>
        <input type="file" className="hidden" accept={accept} onChange={onChange} />
      </label>
    )}
  </Field>
)