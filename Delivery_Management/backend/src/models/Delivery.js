const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    required: true,
  },
  storeId: {   // was: restaurantId
    type: String, 
    required: true,
  },
  driverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Driver',
    default: null 
  },
  storeLocation: {           // was: restaurantLocation
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  customerLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  driverLocation: {
    type: { type: String, default: 'Point' },
    coordinates: { 
      type: [Number],
      default: [0, 0]
    }
  },
  status: {
    type: String,
    // Added 'picking' status — store is still picking items
    enum: ['pending', 'picking', 'ready_for_pickup', 'driver_assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  estimatedPickupTime: Date,
  estimatedDeliveryTime: Date,
  actualPickupTime: Date,
  actualDeliveryTime: Date,
  rating: Number
}, { timestamps: true });

deliverySchema.index({ storeLocation: '2dsphere' });
deliverySchema.index({ customerLocation: '2dsphere' });
deliverySchema.index({ driverLocation: '2dsphere' });

module.exports = mongoose.model('Delivery', deliverySchema);