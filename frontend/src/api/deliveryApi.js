// src/api/deliveryApi.js
// Central API layer — matches your backend routes exactly

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
}

const get   = (path)       => request(path);
const post  = (path, body) => request(path, { method: 'POST',  body: JSON.stringify(body) });
const put   = (path, body) => request(path, { method: 'PUT',   body: JSON.stringify(body) });
const patch = (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) });

// ─── Driver APIs  (routes: /api/drivers) ────────────────────────────────────

export const driverApi = {
  // Registration & basic
  register:              (data)                  => post('/drivers/register', data),
  getById:               (driverId)              => get(`/drivers/${driverId}`),
  getPendingAssignments: (driverId)              => get(`/drivers/${driverId}/pending-assignments`),
  getCurrentOrders:      (driverId)              => get(`/drivers/${driverId}/current-orders`),
  updateAvailability:    (driverId, isAvailable) => put(`/drivers/${driverId}/availability`, { isAvailable }),
  updateLocation:        (driverId, lat, lng)    => put(`/drivers/${driverId}/location`, { latitude: lat, longitude: lng }),
  acceptOrder:           (driverId, orderId)     => post(`/drivers/${driverId}/accept/${orderId}`, {}),
  rejectOrder:           (driverId, orderId, rejectionReason) =>
                                                    post(`/drivers/${driverId}/reject/${orderId}`, { rejectionReason }),
  completeDelivery:      (driverId, orderId)     => post(`/drivers/${driverId}/complete/${orderId}`, {}),

  // ── Profile endpoints (driverProfileRoutes.js) ───────────────────────────
  getProfile:            (driverId)              => get(`/drivers/profile/${driverId}`),
  getProfileByUserId:    (userId)                => get(`/drivers/profile/user/${userId}`),
  updateProfile:         (driverId, data)        => put(`/drivers/profile/${driverId}`, data),
  toggleActiveStatus:    (driverId)              => patch(`/drivers/profile/${driverId}/toggle`, {}),
  getStats:              (driverId)              => get(`/drivers/profile/${driverId}/stats`),
  updateProfileLocation: (driverId, lat, lng)    => put(`/drivers/profile/${driverId}/location`, { latitude: lat, longitude: lng }),
};

// ─── Delivery APIs  (routes: /api/deliveries) ───────────────────────────────

export const deliveryApi = {
  create:              (data)            => post('/deliveries', data),
  getById:             (id)             => get(`/deliveries/${id}`),
  assignDriver:        (id)             => post(`/deliveries/${id}/assign-driver`, {}),
  updateStatus:        (id, status, driverLocation) =>
                                           put(`/deliveries/${id}/status`, { status, driverLocation }),
  updateDriverLocation:(id, coordinates) => put(`/deliveries/${id}/driver-location`, { coordinates }),
  rate:                (id, rating)     => post(`/deliveries/${id}/rate`, { rating }),
};

// ─── Auto-Assignment APIs  (routes: /api/auto) ──────────────────────────────

export const autoAssignmentApi = {
  start:   () => post('/auto/assignment/start', {}),
  stop:    () => post('/auto/assignment/stop', {}),
  trigger: () => post('/auto/assignment/trigger', {}),
};

// ─── Assignment APIs  (routes: /api/assignment) ─────────────────────────────

export const assignmentApi = {
  start:  (intervalMs) => post('/assignment/start', { intervalMs }),
  stop:   ()           => post('/assignment/stop', {}),
  manual: ()           => post('/assignment/manual', {}),
};