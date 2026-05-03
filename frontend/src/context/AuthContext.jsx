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
      const userData = res.data.user
      setUser(userData)
      setSidebar(res.data.sidebar)
      setUserType('system_user')

      // If user is a driver, fetch driver profile and set driverId for socket
      if (userData.role === 'delivery_person' || userData.role?.name?.toLowerCase() === 'driver') {
        try {
          const { driverApi } = await import('../api/deliveryApi')
          const dRes = await driverApi.getProfileByUserId(userData._id)
          if (dRes.success && dRes.driver) {
             localStorage.setItem('fc_driver_id', dRes.driver._id)
          }
        } catch (err) {
          console.error('Error fetching driver profile during fetchMe:', err)
        }
      }
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

  const refreshSidebar = async () => {
    try {
      if (userType === 'supplier') {
        const res = await authAPI.supplierMe()
        setSidebar(res.data.sidebar || [])
      } else {
        const res = await authAPI.me()
        setSidebar(res.data.sidebar || [])
      }
    } catch (err) {
      console.error('Failed to refresh sidebar:', err)
    }
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
  const isDriver     = user?.role?.name?.toLowerCase().includes('driver') || user?.role === 'delivery_person'

  return (
    <AuthContext.Provider value={{
      user, userType, sidebar, loading,
      login, supplierLogin, logout, hasPermission, refreshSidebar,
      isSupplier, isSystemUser, isSuperAdmin, isDriver
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)