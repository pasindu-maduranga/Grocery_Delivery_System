const mongoose = require('mongoose');

const deliveryTripSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner', required: true },
  
  status: {
    type: String,
    enum: ['Assigned', 'Accepted', 'PickedUp', 'InTransit', 'Delivered', 'Cancelled'],
    default: 'Assigned'
  },

  customerDetails: {
    name: { type: String },
    phone: { type: String },
    deliveryAddress: { type: String },
    latitude: { type: Number },
    longitude: { type: Number }
  },

  tripData: {
    distanceKm: { type: Number, default: 0 },
    estimatedTimeMins: { type: Number, default: 0 },
    demandSurgeMultiplier: { type: Number, default: 1.0 }
  },

  financials: {
    customerDeliveryFee: { type: Number, required: true, default: 350 },
    groceryCommissionAmount: { type: Number, default: 70 }, // 20%
    platformFee: { type: Number, default: 30 },
    riderEarning: { type: Number, default: 250 },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' }
  },
  
  timestamps: {
    assignedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('DeliveryTrip', deliveryTripSchema);
