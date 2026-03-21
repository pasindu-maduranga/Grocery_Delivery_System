import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/index'
import React from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]         = useState(null)
  const [userType, setUserType] = useState(null)
  const [sidebar, setSidebar]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const token     = localStorage.getItem('token')
    const savedType = localStorage.getItem('userType')
    if (token && savedType) {
      if (savedType === 'supplier') fetchSupplierMe()
      else fetchMe()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchMe = async () => {
    try {
      const res = await authAPI.me()
      setUser(res.data.user)
      setSidebar(res.data.sidebar)
      setUserType('system_user')
    } catch {
      localStorage.clear()
    } finally {
      setLoading(false)
    }
  }

  const fetchSupplierMe = async () => {
    try {
      const res = await authAPI.supplierMe()
      setUser(res.data.user)
      setSidebar(res.data.sidebar || [])
      setUserType('supplier')
    } catch {
      localStorage.clear()
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('userType', res.data.userType)
    setUser(res.data.user)
    setUserType(res.data.userType)
    if (res.data.userType === 'system_user') await fetchMe()
    return res.data
  }

  const supplierLogin = async (username, password) => {
    const res = await authAPI.supplierLogin({ username, password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('userType', res.data.userType)
    setUser(res.data.user)
    setUserType(res.data.userType)
    await fetchSupplierMe()
    return res.data
  }

  const logout = async () => {
    try { await authAPI.logout() } catch {}
    localStorage.clear()
    setUser(null)
    setUserType(null)
    setSidebar([])
  }

  const hasPermission = (screenCode, action = 'canView') => {
    if (user?.isSuperAdmin) return true
    return user?.permissions?.some(p => p.screenCode === screenCode && p[action]) || false
  }

  const isSupplier   = userType === 'supplier'
  const isSystemUser = userType === 'system_user'
  const isSuperAdmin = userType === 'system_user' && user?.isSuperAdmin === true

  return (
    <AuthContext.Provider value={{
      user, userType, sidebar, loading,
      login, supplierLogin, logout, hasPermission,
      isSupplier, isSystemUser, isSuperAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)