import api from "./userApi";

// Start checkout (both COD and Stripe)
export const processCheckout = (payload) =>
  api.post("/payment/process-checkout", payload);

export const verifyCheckout = (sessionId) =>
  api.post("/payment/verify-checkout", { sessionId });