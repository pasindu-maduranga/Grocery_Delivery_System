const axios = require("axios");

const BASE = process.env.DELIVERY_SERVICE_URL;

const requestDelivery = async ({ orderId, address, addressLocation }) => {
  try {
    const res = await axios.post(`${BASE}/api/delivery/request`, {
      orderId,
      address,
      addressLocation,
    });
    return res.data; // { deliveryId, rider: { id, name, phone } }
  } catch (err) {
    throw new Error(`Delivery Service error: ${err.response?.data?.message || err.message}`);
  }
};

const cancelDelivery = async (deliveryId) => {
  try {
    const res = await axios.patch(`${BASE}/api/delivery/${deliveryId}/cancel`);
    return res.data;
  } catch (err) {
    throw new Error(`Delivery Service error: ${err.response?.data?.message || err.message}`);
  }
};

module.exports = { requestDelivery, cancelDelivery }; // 👈 export both