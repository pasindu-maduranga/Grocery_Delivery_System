import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  res => res,
  err => {
    const isAuthEndpoint = err.config?.url?.includes('/auth/')
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  supplierLogin: (data) => api.post('/auth/supplier-login', data),
  me: () => api.get('/auth/me'),
  supplierMe: () => api.get('/auth/supplier-me'),
  logout: () => api.post('/auth/logout'),
  updateSupplierProfile: (data) => api.put('/auth/supplier-profile', data),
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

export const suppliersAPI = {
  getAll: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  approve: (id, data) => api.patch(`/suppliers/${id}/approve`, data),
  reject: (id, data) => api.patch(`/suppliers/${id}/reject`, data),
  toggleActive: (id) => api.patch(`/suppliers/${id}/toggle-active`),
  toggleLock: (id) => api.patch(`/suppliers/${id}/toggle-lock`),
  updateRole: (id, data) => api.patch(`/suppliers/${id}/role`, data),
}

export const groceryItemsAPI = {
  getMy: () => api.get('/grocery-items/my'),
  getAll: (params) => api.get('/grocery-items', { params }),
  getById: (id) => api.get(`/grocery-items/${id}`),
  create: (formData) => api.post('/grocery-items', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/grocery-items/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/grocery-items/${id}`),
}

export const grocerySubmissionsAPI = {
  getMy: () => api.get('/grocery-submissions/my'),
  getAll: (params) => api.get('/grocery-submissions', { params }),
  getById: (id) => api.get(`/grocery-submissions/${id}`),
  send: (data) => api.post('/grocery-submissions', data),
  accept: (id, data) => api.patch(`/grocery-submissions/${id}/accept`, data),
  reject: (id, data) => api.patch(`/grocery-submissions/${id}/reject`, data),
}

export const inventoryAPI = {
  getAll: (params) => api.get('/inventory', { params }),
  getLowStock: () => api.get('/inventory/low-stock'),
  getById: (id) => api.get(`/inventory/${id}`),
  updateLevels: (id, data) => api.patch(`/inventory/${id}/levels`, data),
  sendReorderAlert: (id) => api.post(`/inventory/${id}/reorder-alert`),
}

export const notificationsAPI = {
  getAdmin: () => api.get('/notifications/admin'),
  getSupplier: () => api.get('/notifications/supplier'),
  markAdminRead: (id) => api.patch(`/notifications/admin/${id}/read`),
  markSupplierRead: (id) => api.patch(`/notifications/supplier/${id}/read`),
}

export const paymentsAPI = {
  createPaymentIntent: (data) => api.post('/payments/create-payment-intent', data),
  confirmPayment: (data) => api.post('/payments/confirm', data),
  syncToStorefront: (data) => api.post('/payments/sync-to-storefront', data),
  getAllTransactions: (params) => api.get('/payments/transactions', { params }),
  getMyTransactions: () => api.get('/payments/my-transactions'),
  getAnalytics: (params) => api.get('/payments/analytics', { params }),
  getSupplierAnalytics: () => api.get('/payments/supplier-analytics'),
}

export const storefrontAPI = {
  getAll: (params) => api.get('/storefront', { params }),
  getById: (id) => api.get(`/storefront/${id}`),
}

export default api
