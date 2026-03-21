const { VEHICLE_TYPES } = require("../enums/VehicleType");

module.exports = {
  vehicleType: { type: String, enum: VEHICLE_TYPES, default: "motorcycle" },
  licensePlate: { type: String },
  currentLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    lastUpdated: { type: Date, default: Date.now },
  },
  isAvailable: { type: Boolean, default: false },
  currentOrders: [{ type: String }], // Order IDs
};
