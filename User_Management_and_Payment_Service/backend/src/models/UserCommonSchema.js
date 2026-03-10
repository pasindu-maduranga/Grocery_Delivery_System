const { USER_ROLES } = require('../enums/Role');

module.exports = {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phoneNo: { type: String },
    address: { type: String },
    role: { type: String, enum: USER_ROLES, default: 'customer' },
    avatar: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    googleId: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    verificationToken: { type: String },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}