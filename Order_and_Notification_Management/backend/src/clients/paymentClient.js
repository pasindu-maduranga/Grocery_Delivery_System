const axios = require('axios');

const BASE = process.env.PAYMENT_SERVICE_URL;

const initiatePayment = async ({ orderId, total, paymentMethod }) => {
  // ── MOCK (remove when payment service is live)
  console.log(`[MOCK] Payment initiated for order ${orderId} — amount: ${total}`);
  return { paymentId: `PAY-MOCK-${Date.now()}`, status: 'pending' };

  // ── REAL call (uncomment when payment service is ready)
  // const res = await axios.post(`${BASE}/api/payments/initiate`, {
  //   orderId,
  //   amount: total,
  //   paymentMethod,
  // });
  // return res.data;
};

module.exports = { initiatePayment };