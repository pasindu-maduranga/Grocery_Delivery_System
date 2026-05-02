const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  permissions: [{
    screenCode: String,
    canView: Boolean,
    canCreate: Boolean,
    canEdit: Boolean,
    canDelete: Boolean
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
