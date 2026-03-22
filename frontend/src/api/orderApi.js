import axios from 'axios';

const BASE_URL = import.meta.env.VITE_ORDER_SERVICE_URL || 'http://localhost:5004/api';

const orderAxios = axios.create({ baseURL: BASE_URL });

// Attach JWT from localStorage automatically
orderAxios.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const orderApi = {
  // Admin reads
  getAllOrders:  (params) => orderAxios.get('/orders', { params }),
  getOrderById: (id)     => orderAxios.get(`/orders/${id}`),
  getStats:     ()       => orderAxios.get('/orders/stats'),

  // Admin actions
  updateStatus: (id, status, adminNotes) =>
    orderAxios.patch(`/orders/${id}/status`, { status, adminNotes }),
  deleteOrder: (id) => orderAxios.delete(`/orders/${id}`),

  // Called by customer service to push new orders
  receiveOrder: (data) => orderAxios.post('/orders', data),
};

export default orderAxios;
