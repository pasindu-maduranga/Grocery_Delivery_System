const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Screen name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Screen code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      required: [true, 'Menu is required'],
    },
    route: {
      type: String,
      required: [true, 'Frontend route is required'],
      
    },
    description: {
      type: String,
    },
    order: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Screen || mongoose.model('Screen', screenSchema);
