import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../../components/common/index'
import { UnauthorizedPage } from '../../pages/ErrorPages'
import React from 'react'

export const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Spinner size="lg" /></div>
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export const PermissionRoute = ({ children, screenCode, action = 'canView' }) => {
  const { hasPermission } = useAuth()
  if (!hasPermission(screenCode, action)) return <UnauthorizedPage />
  return children
}