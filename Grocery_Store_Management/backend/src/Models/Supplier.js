const mongoose = require('mongoose');

const supplyCategorySchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, default: 'kg', trim: true },
}, { _id: false });

const supplierSchema = new mongoose.Schema({
  // ── Business Info ──────────────────────────────────────────
  businessName:       { type: String, required: true, trim: true },
  registrationNumber: { type: String, trim: true },
  yearEstablished:    { type: Number },
  businessType:       { type: String, trim: true },
  businessLogo:       { type: String },       // cloudinary URL
  profilePic:         { type: String },       // cloudinary URL

  // ── Contact Info ───────────────────────────────────────────
  contactPersonName:  { type: String, required: true, trim: true },
  email:              { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:              { type: String, required: true, trim: true },
  whatsapp:           { type: String, trim: true },
  website:            { type: String, trim: true },

  // ── Warehouse / Office Address ─────────────────────────────
  streetAddress:  { type: String, trim: true },
  city:           { type: String, trim: true },
  stateProvince:  { type: String, trim: true },
  postalCode:     { type: String, trim: true },
  country:        { type: String, default: 'United States', trim: true },

  // ── Supply Categories with Quantity ───────────────────────
  supplyCategories: [supplyCategorySchema],

  // ── Compliance Documents ───────────────────────────────────
  businessLicenseFile: { type: String },  // cloudinary URL
  taxCertificateFile:  { type: String },  // cloudinary URL
  bankStatementFile:   { type: String },  // cloudinary URL

  // ── Bank Account Details ───────────────────────────────────
  bankName:          { type: String, trim: true },
  accountHolderName: { type: String, trim: true },
  accountNumber:     { type: String, trim: true },
  swiftCode:         { type: String, trim: true },
  paymentMethod:     { type: String, enum: ['bank_transfer', 'payment_gateway', 'both'], default: 'both' },

  // ── Portal Access (set after approval) ────────────────────
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  role:     { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  isActive: { type: Boolean, default: true },
  isLocked: { type: Boolean, default: false },
  lastLoginAt: { type: Date },

  // ── Approval Flow ──────────────────────────────────────────
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  approvalNote:  { type: String },
  approvedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'SystemUser' },
  approvedAt:    { type: Date },
  rejectedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'SystemUser' },
  rejectedAt:    { type: Date },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'SystemUser' },
}, { timestamps: true });

const bcrypt = require('bcryptjs');
supplierSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

supplierSchema.methods.comparePassword = async function (candidate) {
  return require('bcryptjs').compare(candidate, this.password);
};

module.exports = mongoose.model('Supplier', supplierSchema);