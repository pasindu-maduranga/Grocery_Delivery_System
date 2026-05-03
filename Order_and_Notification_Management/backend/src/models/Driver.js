const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  vehicleType: {
    type: String,
    enum: ['Car', 'Motorcycle', 'Van', 'Scooter'],  // Removed Bicycle, added Van for bulk grocery
    default: 'Car'
  },
  maxCarryWeightKg: {   // NEW: used to filter drivers for heavy grocery orders
    type: Number,
    default: 20
  },
  licensePlate: { type: String },
  profilePhoto: { type: String, default: '' },   // NEW: profile photo URL
  isAvailable: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    lastUpdated: Date
  },
  pendingAssignments: [String],
  currentOrders: [String],
  completedOrders: [String],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
}, { timestamps: true });

driverSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId });
};

module.exports = mongoose.model('Driver', driverSchema);