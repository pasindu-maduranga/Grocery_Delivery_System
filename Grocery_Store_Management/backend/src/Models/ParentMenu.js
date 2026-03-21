const mongoose = require('mongoose');

const parentMenuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Parent menu name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Parent menu code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    icon: {
      type: String,
      default: 'folder',
    },
    order: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuperAdminOnly: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ParentMenu || mongoose.model('ParentMenu', parentMenuSchema);
