import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL_GROCERY_MANAGEMENT_SERVICE || 'http://localhost:5001/api',
});

// Since the Customer frontend might have its own api config,
// we just create a separate instance for STOREFRONT interactions which point to port 5000.

export const storefrontAPI = {
  getAll: (params) => api.get('/storefront', { params }),
  getById: (id) => api.get(`/storefront/${id}`),
};
