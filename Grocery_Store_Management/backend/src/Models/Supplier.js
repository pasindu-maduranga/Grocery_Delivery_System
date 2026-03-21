const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const supplyCategorySchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  unit:     { type: String, default: 'kg', trim: true },
}, { _id: false });

const supplierSchema = new mongoose.Schema({
  businessName:       { type: String, required: true, trim: true },
  registrationNumber: { type: String, trim: true },
  yearEstablished:    { type: Number },
  businessType:       { type: String, trim: true },

  contactPersonName: { type: String, required: true, trim: true },
  email:             { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:             { type: String, required: true, trim: true },
  whatsapp:          { type: String, trim: true },
  website:           { type: String, trim: true },

  streetAddress: { type: String, trim: true },
  city:          { type: String, trim: true },
  stateProvince: { type: String, trim: true },
  postalCode:    { type: String, trim: true },
  country:       { type: String, default: 'United States', trim: true },

  supplyCategories: [supplyCategorySchema],

  bankName:          { type: String, trim: true },
  accountHolderName: { type: String, trim: true },
  accountNumber:     { type: String, trim: true },
  swiftCode:         { type: String, trim: true },
  paymentMethod:     { type: String, enum: ['bank_transfer', 'payment_gateway', 'both'], default: 'both' },

  username:    { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password:    { type: String, select: false },
  role:        { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  isActive:    { type: Boolean, default: true },
  isLocked:    { type: Boolean, default: false },
  lastLoginAt: { type: Date },

  status:       { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvalNote: { type: String },
  approvedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'SystemUser' },
  approvedAt:   { type: Date },
  rejectedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'SystemUser' },
  rejectedAt:   { type: Date },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'SystemUser' },
}, { timestamps: true });

supplierSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

supplierSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);
