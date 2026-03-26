import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://user-payment-service.livelyforest-bef090db.eastus.azurecontainerapps.io/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ✅ no custom Cache-Control/Pragma headers (avoid CORS preflight block)
export const getOrders = () => api.get("/user/orders");

export default api;