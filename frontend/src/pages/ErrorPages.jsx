import { useNavigate } from 'react-router-dom'
import { ShieldOff, Home, ArrowLeft } from 'lucide-react'
import React from 'react'

export const UnauthorizedPage = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldOff size={36} className="text-red-500" />
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-8">You don't have permission to view this page.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary mx-auto">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    </div>
  )
}

export const NotFoundPage = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="font-display text-8xl font-bold text-slate-200 mb-4">404</div>
        <h1 className="font-display text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
        <p className="text-slate-500 mb-8">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary mx-auto">
          <Home size={16} /> Back to Dashboard
        </button>
      </div>
    </div>
  )
}