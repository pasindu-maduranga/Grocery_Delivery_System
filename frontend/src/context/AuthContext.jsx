import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/index'
import React from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [sidebar, setSidebar] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) fetchMe()
    else setLoading(false)
  }, [])

  const fetchMe = async () => {
    try {
      const res = await authAPI.me()
      setUser(res.data.user)
      setSidebar(res.data.sidebar)
    } catch {
      localStorage.clear()
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    await fetchMe()
    return res.data
  }

  const logout = async () => {
    try { await authAPI.logout() } catch {}
    localStorage.clear()
    setUser(null)
    setSidebar([])
  }

  const hasPermission = (screenCode, action = 'canView') => {
    if (user?.isSuperAdmin) return true
    return user?.permissions?.some(p => p.screenCode === screenCode && p[action]) || false
  }

  return (
    <AuthContext.Provider value={{ user, sidebar, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)