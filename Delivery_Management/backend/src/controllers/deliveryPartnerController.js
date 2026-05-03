const DeliveryPartner = require('../models/DeliveryPartner');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// ─── HELPERS ──────────────────────────────────────────────────────

const getTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  return Array.from({ length: 10 }, () => chars[crypto.randomInt(chars.length)]).join('');
};

const sendDriverApprovalEmail = async ({ to, driverName, username, password, roleName }) => {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Grocery Delivery System" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🚚 Your Driver Account Has Been Approved',
    html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f0fdf4;padding:24px;">
      <div style="background:#fff;border-radius:16px;padding:40px;border:1px solid #d1fae5;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        <div style="text-align:center;margin-bottom:28px;">
          <div style="width:60px;height:60px;background:#059669;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;box-shadow:0 4px 10px rgba(5,150,105,0.3);">
            <span style="color:#fff;font-size:30px;">🚚</span>
          </div>
          <h1 style="color:#064e3b;font-size:24px;font-weight:800;margin:0 0 6px;">Welcome to the Fleet!</h1>
          <p style="color:#059669;font-size:14px;font-weight:600;margin:0;">FreshCart Delivery Partner Network</p>
        </div>

        <p style="color:#374151;font-size:15px;line-height:1.6;">
          Hello <strong>${driverName}</strong>,<br/><br/>
          Your driver application has been <strong style="color:#16a34a;">approved</strong>!
          You can now log in to the Driver Portal using the credentials below.
        </p>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;margin:24px 0;">
          <p style="color:#166534;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin:0 0 14px;">Driver Access Details</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:38%;">Username</td>
                <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:700;font-family:monospace;">${username}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Password</td>
                <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:700;font-family:monospace;">${password}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Role</td>
                <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:700;">${roleName}</td></tr>
          </table>
        </div>

        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px;margin-bottom:24px;">
          <p style="color:#92400e;font-size:13px;margin:0;font-weight:600;">⚠️ Please change your password after first login for security.</p>
        </div>

        <p style="color:#9ca3af;font-size:11px;text-align:center;margin:0;border-top:1px solid #f0fdf4;padding-top:20px;">
          FreshCart Delivery System • Automated Security Email
        </p>
      </div>
    </div>`,
  });
};

const sendDriverRejectionEmail = async ({ to, driverName, reason }) => {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Grocery Delivery System" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Update on Your Driver Application',
    html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#fff;border-radius:16px;padding:40px;border:1px solid #e5e7eb;">
        <h1 style="color:#111827;font-size:22px;font-weight:700;">Application Status Update</h1>
        <p style="color:#374151;font-size:15px;line-height:1.6;">
          Dear <strong>${driverName}</strong>,<br/><br/>
          After careful review, we are unable to approve your driver application at this time.
        </p>
        ${reason ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin:20px 0;">
          <p style="color:#991b1b;font-size:14px;margin:0;"><strong>Reason: </strong>${reason}</p></div>` : ''}
        <p style="color:#6b7280;font-size:14px;">You may reapply after addressing the above concerns.</p>
      </div>
    </div>`,
  });
};

// ─── REGISTER (creates with status=pending, NO password/role yet) ──

exports.registerPartner = async (req, res) => {
    try {
        const { name, username, email, phone, nic, location, vehicle } = req.body;
        
        let existingUser = await DeliveryPartner.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ message: "Partner with this email or username already exists" });

        const newPartner = new DeliveryPartner({
            name,
            username,
            email,
            phone,
            nic,
            location,
            vehicle,
            accountStatus: 'pending',
        });

        await newPartner.save();

        res.status(201).json({ 
            success: true,
            message: "Delivery partner registered successfully. Awaiting approval.", 
            partner: newPartner 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ─── APPROVE (assigns role, generates password, sends email) ──────

exports.approvePartner = async (req, res) => {
    try {
        const { username, roleId, approvalNote } = req.body;

        const partner = await DeliveryPartner.findById(req.params.id);
        if (!partner) return res.status(404).json({ success: false, message: 'Driver not found' });
        if (partner.accountStatus === 'approved') return res.status(400).json({ success: false, message: 'Already approved' });

        const role = await Role.findById(roleId);
        if (!role || !role.isActive) return res.status(400).json({ success: false, message: 'Invalid or inactive role' });

        // Check username uniqueness
        const existingUser = await DeliveryPartner.findOne({ username: username?.toLowerCase(), _id: { $ne: partner._id } });
        if (existingUser) return res.status(400).json({ success: false, message: 'Username already taken' });

        const plainPassword      = generatePassword();
        partner.username         = username.toLowerCase();
        partner.password         = plainPassword; // bcrypt pre-save hook will hash
        partner.role             = roleId;
        partner.accountStatus    = 'approved';
        partner.approvalNote     = approvalNote || '';
        partner.approvedBy       = req.user?.userId || req.user?.id || 'system';
        partner.approvedAt       = new Date();
        partner.isActive         = true;
        await partner.save();

        // Send credentials email
        try {
            await sendDriverApprovalEmail({
                to: partner.email,
                driverName: partner.name,
                username: partner.username,
                password: plainPassword,
                roleName: role.name,
            });
        } catch (mailErr) { console.error('Email send failed:', mailErr.message); }

        const updated = await DeliveryPartner.findById(partner._id)
            .populate('role', 'name')
            .select('-password');
        res.json({ success: true, message: 'Driver approved and credentials sent via email', data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── REJECT ───────────────────────────────────────────────────────

exports.rejectPartner = async (req, res) => {
    try {
        const { approvalNote } = req.body;
        const partner = await DeliveryPartner.findById(req.params.id);
        if (!partner) return res.status(404).json({ success: false, message: 'Driver not found' });

        partner.accountStatus = 'rejected';
        partner.approvalNote  = approvalNote || '';
        partner.rejectedBy    = req.user?.userId || req.user?.id || 'system';
        partner.rejectedAt    = new Date();
        await partner.save();

        try {
            await sendDriverRejectionEmail({ to: partner.email, driverName: partner.name, reason: approvalNote });
        } catch (mailErr) { console.error('Email send failed:', mailErr.message); }

        res.json({ success: true, message: 'Driver rejected and notified via email' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── TOGGLE ACTIVE ────────────────────────────────────────────────

exports.toggleActive = async (req, res) => {
    try {
        const partner = await DeliveryPartner.findById(req.params.id);
        if (!partner) return res.status(404).json({ success: false, message: 'Driver not found' });
        partner.isActive = !partner.isActive;
        await partner.save({ validateBeforeSave: false });
        res.json({ success: true, message: `Driver ${partner.isActive ? 'activated' : 'deactivated'}`, isActive: partner.isActive });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── TOGGLE LOCK ──────────────────────────────────────────────────

exports.toggleLock = async (req, res) => {
    try {
        const partner = await DeliveryPartner.findById(req.params.id);
        if (!partner) return res.status(404).json({ success: false, message: 'Driver not found' });
        partner.isLocked = !partner.isLocked;
        await partner.save({ validateBeforeSave: false });
        res.json({ success: true, message: `Driver ${partner.isLocked ? 'locked' : 'unlocked'}`, isLocked: partner.isLocked });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── LOGIN ────────────────────────────────────────────────────────

exports.loginPartner = async (req, res) => {
    try {
        const { username, password } = req.body;
        const partner = await DeliveryPartner.findOne({ username }).select('+password').populate('role');
        
        if (!partner) return res.status(404).json({ success: false, message: "Invalid credentials" });
        if (partner.accountStatus !== 'approved') return res.status(403).json({ success: false, message: "Account not approved yet. Contact Admin." });
        if (!partner.isActive) return res.status(403).json({ success: false, message: "Account deactivated. Contact Admin." });
        if (partner.isLocked) return res.status(403).json({ success: false, message: "Account locked. Contact Admin." });

        const isMatch = await partner.comparePassword(password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const token = jwt.sign(
            { id: partner._id, userId: partner._id, username: partner.username, userType: 'driver' },
            process.env.JWT_SECRET || 'grocery_secret',
            { expiresIn: '1d' }
        );

        const { password: _, ...partnerData } = partner.toObject();
        res.json({ success: true, message: "Login successful", token, partner: partnerData });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ─── GET ALL (filterable by accountStatus) ────────────────────────

exports.getAllPartners = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.accountStatus = req.query.status;
        const partners = await DeliveryPartner.find(filter)
            .populate('role', 'name')
            .select('-password')
            .sort('-createdAt');
        res.json({ success: true, count: partners.length, data: partners });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ─── GET ROLES (for approve modal dropdown) ───────────────────────

exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find({ isActive: true });
        res.json({ success: true, data: roles });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ─── LOCATION/STATUS UPDATE ───────────────────────────────────────

exports.updateLocationAndStatus = async (req, res) => {
    try {
        const { isOnline, latitude, longitude } = req.body;
        const partnerId = req.user.id;

        const partner = await DeliveryPartner.findByIdAndUpdate(
            partnerId,
            {
                'status.isOnline': isOnline,
                ...(latitude && longitude ? { 'status.currentLatitude': latitude, 'status.currentLongitude': longitude, 'status.lastUpdated': new Date() } : {})
            },
            { new: true }
        ).select('-password');

        res.json(partner);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ─── NEARBY ONLINE PARTNERS ──────────────────────────────────────

exports.getNearbyOnlinePartners = async (req, res) => {
    try {
        const partners = await DeliveryPartner.find({ 'status.isOnline': true, accountStatus: 'approved', isActive: true }).select('-password');
        res.json(partners);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
