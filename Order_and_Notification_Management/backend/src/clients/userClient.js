//to call the user service to fetch the data
const axios = require("axios");

const BASE = process.env.USER_SERVICE_URL;

const getUserById = async (userId) => {
  try {
    const res = await axios.get(`${BASE}/api/users/${userId}`);
    return res.data; // { _id, name, email, phone }
  } catch (err) {
    throw new Error(`User Service error: ${err.response?.data?.message || err.message}`);
  }
};

module.exports = { getUserById };