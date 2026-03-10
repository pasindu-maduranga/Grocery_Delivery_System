import api from "./userApi";

// Stripe checkout session creation
export const createCheckoutSession = (items, currency = "usd") =>
  api.post("/payment/create-checkout-session", { items, currency });