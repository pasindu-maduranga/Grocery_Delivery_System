const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/emailUtils");
const generateAccessToken = require("../utils/generateToken");

//register new user
const registerUser = async (data) => {
  const {
    name,
    email,
    password,
    phoneNo,
    address,
    role,
    // businessName,
    // businessAddress,
    // taxId,
    // businessPhoneNo,
    // ItemTypes,
    // vehicleType,
    // licensePlate,
    // currentLocation,
    // isAvailable,
    // currentOrders,
  } = data;

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
    // businessName,
    // businessAddress,
    // taxId,
    // businessPhoneNo,
    // ItemTypes,
    // vehicleType,
    // licensePlate,
    // currentLocation,
    // isAvailable,
    // currentOrders,
  });

  await user.save();

  const token = generateAccessToken(user);

  return {
    user,
    token,
  };
};

//login
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
  return {
    user,
    token,
  };
};

//forgot password
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  //Generate secure token and hash for storage
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //Set token & 1 hour expiry
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  await user.save();

  //Build reset URL (frontend handles the form)
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  // Email content (keep simple or make it as stylish as your welcome email)
  const html = `
        <h2>Reset Your Grocery Store Password</h2>
        <p>Hello ${user.name || "User"},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background:#FF6B35; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; display:inline-block;">
        Reset Password
        </a>
        <p>Reset Token: ${resetToken}</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, ignore this email.</p>
        <p>RapidCart Team</p>
    `;

  await sendEmail({
    to: user.email,
    subject: "RapidCart-Password Reset Request",
    html,
  });

  return {
    message: "Password reset email sent. Check your inbox",
  };
};

const resetPassword = async ({ email, token, newPassword }) => {
  if (!token || !newPassword) {
    throw new Error("Invalid request: token and password required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    email,
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  // Hash and save new password
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return {
    message:
      "Password reset successful. You can now log in with your new password.",
  };
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
