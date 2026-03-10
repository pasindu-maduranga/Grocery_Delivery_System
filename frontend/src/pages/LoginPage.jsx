import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShoppingCart, Eye, EyeOff, AlertCircle } from 'lucide-react'
import React from 'react'

export default function LoginPage() {
  const { login, supplierLogin } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]         = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Try system user login first
      const res = await login(form.username, form.password)
      if (res.userType === 'supplier') {
        navigate('/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch {
      // Fall back to supplier login
      try {
        await supplierLogin(form.username, form.password)
        navigate('/dashboard')
      } catch (supplierErr) {
        setError(supplierErr.response?.data?.message || 'Invalid credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-primary-950 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-700 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <ShoppingCart size={20} className="text-white" />
          </div>
          <span className="font-display text-white text-xl font-bold">GroceryMS</span>
        </div>
        <div className="relative z-10">
          <h1 className="font-display text-5xl font-bold text-white leading-tight mb-4">
            Grocery Store<br />Management<br />
            <span className="text-primary-400">System</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Complete inventory, supplier and storefront management for your grocery business.
          </p>
        </div>
        <div className="relative z-10 flex gap-6">
          {['Inventory', 'Suppliers', 'Tenders', 'Storefront'].map(item => (
            <div key={item} className="text-center">
              <div className="text-primary-400 font-display font-bold text-lg">✓</div>
              <div className="text-slate-500 text-xs mt-1">{item}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <ShoppingCart size={18} className="text-white" />
            </div>
            <span className="font-display text-white text-lg font-bold">GroceryMS</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-slate-400 mb-8 text-sm">Sign in to your account to continue</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="Enter your username"
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 pr-11 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-slate-600 text-xs text-center mt-8">
            Grocery Store Management System © 2026
          </p>
        </div>
      </div>
    </div>
  )
}