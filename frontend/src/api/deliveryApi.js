// src/api/deliveryApi.js
const BASE_URL = import.meta.env.VITE_DELIVERY_SERVICE_URL || 'http://localhost:5005/api';
const USER_BASE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:5003/api';

async function request(baseUrl, path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { 
        'Content-Type': 'application/json', 
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers 
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
}

const get   = (url, path)       => request(url, path);
const post  = (url, path, body) => request(url, path, { method: 'POST',  body: JSON.stringify(body) });
const patch = (url, path, body) => request(url, path, { method: 'PATCH', body: JSON.stringify(body) });
const put   = (url, path, body) => request(url, path, { method: 'PUT',   body: JSON.stringify(body) });

export const driverApi = {
  create: (data) => post(USER_BASE_URL, '/auth/admin/create-driver', data),
  getAll: () => get(BASE_URL, '/drivers'),
  getById: (driverId) => get(BASE_URL, `/drivers/${driverId}`),
  updateAvailability: (driverId, isAvailable) => put(BASE_URL, `/drivers/${driverId}/availability`, { isAvailable }),
  updateLocation: (driverId, lat, lng) => put(BASE_URL, `/drivers/${driverId}/location`, { latitude: lat, longitude: lng }),
  toggleActive: (driverId) => patch(BASE_URL, `/drivers/${driverId}/toggle-active`, {}),
  getAvailableDrivers: () => get(BASE_URL, '/drivers/available'),
  getPayouts: (driverId) => get(BASE_URL, `/drivers/${driverId}/payout-history`),
  processPayout: (driverId, data) => post(BASE_URL, `/drivers/${driverId}/payout`, data)
};

export const deliveryApi = {
  getStats: () => get(BASE_URL, '/deliveries/stats'),
  getDispatchBoard: () => get(BASE_URL, '/deliveries/dispatch-board'),
  assignDriver: (orderId, driverId) => post(BASE_URL, '/deliveries/assign-driver', { orderId, driverId }),
};

// Re-adding assignmentApi to fix build break in AdminAssignmentPage.jsx
export const assignmentApi = {
  start:  (intervalMs) => post(BASE_URL, '/assignment/start', { intervalMs }),
  stop:   ()           => post(BASE_URL, '/assignment/stop', {}),
  manual: ()           => post(BASE_URL, '/assignment/manual', {}),
  assignOrder: (orderId, driverId) => post(BASE_URL, '/deliveries/assign-driver', { orderId, driverId }),
};