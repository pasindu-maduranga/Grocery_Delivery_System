import axios from 'axios'

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL 
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

export const rolesAPI = {
  getAll: () => api.get('/roles'),
  getById: (id) => api.get(`/roles/${id}`),
  create: (data) => api.post('/roles', data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`),
  getPermissions: (id) => api.get(`/roles/${id}/permissions`),
  updatePermissions: (id, data) => api.put(`/roles/${id}/permissions`, data),
}

export const usersAPI = {
  getAll: () => api.get('/system-users'),
  getById: (id) => api.get(`/system-users/${id}`),
  create: (data) => api.post('/system-users', data),
  update: (id, data) => api.put(`/system-users/${id}`, data),
  toggleActive: (id) => api.patch(`/system-users/${id}/toggle-active`),
  toggleLock: (id) => api.patch(`/system-users/${id}/toggle-lock`),
  resetPassword: (id, data) => api.patch(`/system-users/${id}/reset-password`, data),
}

export const modulesAPI = {
  getStructure: () => api.get('/modules/structure'),
  getParentMenus: () => api.get('/modules/parent-menus'),
  createParentMenu: (data) => api.post('/modules/parent-menus', data),
  updateParentMenu: (id, data) => api.put(`/modules/parent-menus/${id}`, data),
  toggleParentMenu: (id) => api.patch(`/modules/parent-menus/${id}/toggle`),
  getMenus: (parentMenuId) => api.get('/modules/menus', { params: { parentMenuId } }),
  createMenu: (data) => api.post('/modules/menus', data),
  updateMenu: (id, data) => api.put(`/modules/menus/${id}`, data),
  toggleMenu: (id) => api.patch(`/modules/menus/${id}/toggle`),
  getScreens: (menuId) => api.get('/modules/screens', { params: { menuId } }),
  createScreen: (data) => api.post('/modules/screens', data),
  updateScreen: (id, data) => api.put(`/modules/screens/${id}`, data),
  toggleScreen: (id) => api.patch(`/modules/screens/${id}/toggle`),
}

export default api