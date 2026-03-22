const mongoose = require('mongoose');


const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Menu name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Menu code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    parentMenu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParentMenu',
      required: [true, 'Parent menu is required'],
    },
    icon: {
      type: String,
      default: 'file',
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

module.exports = mongoose.models.Menu || mongoose.model('Menu', menuSchema);
