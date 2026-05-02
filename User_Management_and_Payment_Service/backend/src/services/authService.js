const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/emailUtils");
const generateAccessToken = require("../utils/generateToken");
const axios = require("axios");

const DELIVERY_SERVICE_URL = process.env.DELIVERY_SERVICE_URL || 'http://localhost:5005/api';

// Register User
const registerUser = async (data) => {
  const { name, email, password, phoneNo, address, role, location } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists with the provided email address");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    phoneNo,
    address,
    role: role || "customer",
    isVerified: true,
    location: location || {},
  });

  await user.save();

  const token = generateAccessToken(user);

  return { user, token };
};

// Admin creating driver
const createDriver = async (data) => {
  const { name, email, phoneNo, address, vehicleType, district, isWithinColombo, maxCarryWeightKg, licensePlate } = data;
  
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email already registered");

  // Generate a random password for the driver
  const temporalPassword = crypto.randomBytes(4).toString('hex');
  const hashedPassword = await bcrypt.hash(temporalPassword, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    phoneNo,
    address,
    role: "delivery_person",
    isVerified: true,
    location: {
        address: address,
        latitude: isWithinColombo ? 6.9147 : 7.2906, // Example coords for Colombo vs Kandy if not provided
        longitude: isWithinColombo ? 79.8612 : 80.6337
    }
  });

  await user.save();

  // Send credentials email
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2e7d32;">Welcome to RapidCart Delivery Team!</h2>
      <p>Hello ${name},</p>
      <p>You have been registered as a delivery rider. Use the following credentials to login:</p>
      <div style="background: #f1f8e9; padding: 15px; border-radius: 8px; border: 1px solid #c8e6c9; margin: 20px 0;">
        <p><strong>Username/Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${temporalPassword}</p>
      </div>
      <p>Please login and update your profile and live location to start receiving orders.</p>
      <p>Best Regards,<br/>RapidCart Admin Team</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "RapidCart-Your Delivery Driver Account",
    html,
  });

  // Call Delivery Service to create Driver record
  try {
    await axios.post(`${DELIVERY_SERVICE_URL}/drivers/register`, {
      userId: user._id.toString(),
      name,
      email,
      phone: phoneNo,
      vehicleType,
      district,
      isWithinColombo: !!isWithinColombo,
      maxCarryWeightKg,
      licensePlate
    });
  } catch (err) {
    console.error("Failed to sync driver to delivery service:", err.message);
  }

  return { user, password: temporalPassword };
};

// Login
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    throw new Error("Invalid user account");
  }

  const matchUser = await bcrypt.compare(password, user.password);
  if (!matchUser) {
    throw new Error("Invalid user account");
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateAccessToken(user);
  return { user, token };
};

// Forgot Password
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  const html = `<h2>Reset Your password</h2><p>Click <a href="${resetUrl}">here</a> to reset.</p>`;

  await sendEmail({ to: user.email, subject: "Password Reset Request", html });
  return { message: "Email sent" };
};

const resetPassword = async ({ email, token, newPassword }) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    email,
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error("Invalid or expired token");

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: "Password updated" };
};

module.exports = {
  registerUser,
  createDriver,
  loginUser,
  forgotPassword,
  resetPassword,
};
