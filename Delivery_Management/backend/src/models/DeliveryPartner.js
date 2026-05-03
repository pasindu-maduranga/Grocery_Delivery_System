const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const deliveryPartnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  phone: { type: String, required: true },
  nic: { type: String, required: true },
  
  location: {
    province: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },

  vehicle: {
    type: { type: String, enum: ['Bicycle', 'Van', 'Lorry', 'Motorcycle'], required: true },
    licensePlate: { type: String },
    licensePhotoUrl: { type: String }
  },

  status: {
    isOnline: { type: Boolean, default: false },
    currentLatitude: { type: Number },
    currentLongitude: { type: Number },
    lastUpdated: { type: Date }
  },

  // Approval workflow (like Supplier)
  accountStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'Active', 'Suspended', 'Pending'], default: 'pending' },
  isActive:      { type: Boolean, default: true },
  isLocked:      { type: Boolean, default: false },
  approvalNote:  { type: String },
  approvedBy:    { type: String },
  approvedAt:    { type: Date },
  rejectedBy:    { type: String },
  rejectedAt:    { type: Date },
  createdBy:     { type: String },
  
  revenue: {
    totalEarned: { type: Number, default: 0 },
    pendingPayout: { type: Number, default: 0 }
  }

}, { timestamps: true });

deliveryPartnerSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

deliveryPartnerSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
