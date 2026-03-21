const axios = require("axios");
//use this calls to grocery service to get grocery and product data
const BASE = process.env.GROCERY_SERVICE_URL;

const getRestaurantById = async (restaurantId) => {
  try {
    const res = await axios.get(`${BASE}/api/restaurants/${restaurantId}`);
    return res.data; // { _id, name, logo, address, contactNumber }
  } catch (err) {
    throw new Error(`Grocery Service error: ${err.response?.data?.message || err.message}`);
  }
};

const getProductById = async (productId) => {
  try {
    const res = await axios.get(`${BASE}/api/products/${productId}`);
    return res.data; // { _id, name, price, image }
  } catch (err) {
    throw new Error(`Grocery Service error: ${err.response?.data?.message || err.message}`);
  }
};

module.exports = { getRestaurantById, getProductById }; // 👈 export both