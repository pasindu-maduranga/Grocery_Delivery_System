import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL_GROCERY_MANAGEMENT_SERVICE || 'https://grocery-backend.livelyforest-bef090db.eastus.azurecontainerapps.io/api',
});


export const storefrontAPI = {
  getAll: (params) => api.get('/storefront', { params }),
  getById: (id) => api.get(`/storefront/${id}`),
};
