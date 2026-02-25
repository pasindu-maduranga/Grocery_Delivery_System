const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: [true, 'Order ID is required'],
      unique: true,
    },
    driverId: {
      type: String,
      default: null,
    },
    customerId: {
      type: String,
      required: [true, 'Customer ID is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
      default: 'pending',
    },
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required'],
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Delivery address is required'],
    },
    estimatedDeliveryTime: {
      type: Date,
      default: null,
    },
    actualDeliveryTime: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Delivery = mongoose.model('Delivery', deliverySchema);

module.exports = Delivery;
