const Supplier = require('../Models/Supplier');
const Role     = require('../Models/Role');
const { connectCloudinary } = require('../Config/cloudinary');
const { sendSupplierApprovalEmail, sendSupplierRejectionEmail } = require('../Config/mailer');
const crypto = require('crypto');

const uploadFileIfExists = async (files, fieldName, folder) => {
  if (files && files[fieldName] && files[fieldName][0]) {
    return connectCloudinary(files[fieldName][0].buffer, folder);
  }
  return null;
};

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  return Array.from({ length: 10 }, () => chars[crypto.randomInt(chars.length)]).join('');
};

const parseCategories = (raw) => {
  if (!raw) return [];
  if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return []; } }
  return raw;
};

// SuperAdmin only — all suppliers, filterable by status
const getAllSuppliers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const suppliers = await Supplier.find(filter)
      .populate('role', 'name')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .select('-password');
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Managers with canView permission — approved suppliers only
const getApprovedSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ status: 'approved' })
      .populate('role', 'name')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .select('-password');
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('role', 'name permissions')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .select('-password');
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, data: supplier });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createSupplier = async (req, res) => {
  try {
    const {
      businessName, registrationNumber, yearEstablished, businessType,
      contactPersonName, email, phone, whatsapp, website,
      streetAddress, city, stateProvince, postalCode, country,
      supplyCategories,
      bankName, accountHolderName, accountNumber, swiftCode, paymentMethod,
    } = req.body;

    const existing = await Supplier.findOne({ email: email?.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const [profilePic, businessLogo, businessLicenseFile, taxCertificateFile, bankStatementFile] = await Promise.all([
      uploadFileIfExists(req.files, 'profilePic',      'suppliers/profile'),
      uploadFileIfExists(req.files, 'businessLogo',    'suppliers/logos'),
      uploadFileIfExists(req.files, 'businessLicense', 'suppliers/docs'),
      uploadFileIfExists(req.files, 'taxCertificate',  'suppliers/docs'),
      uploadFileIfExists(req.files, 'bankStatement',   'suppliers/docs'),
    ]);

    const supplier = await Supplier.create({
      businessName, registrationNumber, yearEstablished, businessType,
      contactPersonName, email, phone, whatsapp, website,
      streetAddress, city, stateProvince, postalCode, country,
      supplyCategories: parseCategories(supplyCategories),
      bankName, accountHolderName, accountNumber, swiftCode, paymentMethod,
      profilePic, businessLogo,
      businessLicenseFile, taxCertificateFile, bankStatementFile,
      status: 'pending',
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Supplier added and sent for approval', data: supplier });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

    const fields = [
      'businessName', 'registrationNumber', 'yearEstablished', 'businessType',
      'contactPersonName', 'email', 'phone', 'whatsapp', 'website',
      'streetAddress', 'city', 'stateProvince', 'postalCode', 'country',
      'bankName', 'accountHolderName', 'accountNumber', 'swiftCode', 'paymentMethod',
    ];
    fields.forEach(f => { if (req.body[f] !== undefined) supplier[f] = req.body[f]; });
    if (req.body.supplyCategories) supplier.supplyCategories = parseCategories(req.body.supplyCategories);

    const [profilePic, businessLogo, businessLicenseFile, taxCertificateFile, bankStatementFile] = await Promise.all([
      uploadFileIfExists(req.files, 'profilePic',      'suppliers/profile'),
      uploadFileIfExists(req.files, 'businessLogo',    'suppliers/logos'),
      uploadFileIfExists(req.files, 'businessLicense', 'suppliers/docs'),
      uploadFileIfExists(req.files, 'taxCertificate',  'suppliers/docs'),
      uploadFileIfExists(req.files, 'bankStatement',   'suppliers/docs'),
    ]);
    if (profilePic)          supplier.profilePic          = profilePic;
    if (businessLogo)        supplier.businessLogo        = businessLogo;
    if (businessLicenseFile) supplier.businessLicenseFile = businessLicenseFile;
    if (taxCertificateFile)  supplier.taxCertificateFile  = taxCertificateFile;
    if (bankStatementFile)   supplier.bankStatementFile   = bankStatementFile;

    await supplier.save({ validateBeforeSave: false });
    const updated = await Supplier.findById(supplier._id).populate('role', 'name').select('-password');
    res.json({ success: true, message: 'Supplier updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const approveSupplier = async (req, res) => {
  try {
    const { username, roleId, approvalNote } = req.body;

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    if (supplier.status === 'approved') return res.status(400).json({ success: false, message: 'Already approved' });

    const role = await Role.findById(roleId);
    if (!role || !role.isActive) return res.status(400).json({ success: false, message: 'Invalid or inactive role' });

    const existingUser = await Supplier.findOne({ username: username?.toLowerCase(), _id: { $ne: supplier._id } });
    if (existingUser) return res.status(400).json({ success: false, message: 'Username already taken' });

    const plainPassword   = generatePassword();
    supplier.username     = username.toLowerCase();
    supplier.password     = plainPassword;
    supplier.role         = roleId;
    supplier.status       = 'approved';
    supplier.approvalNote = approvalNote || '';
    supplier.approvedBy   = req.user._id;
    supplier.approvedAt   = new Date();
    supplier.isActive     = true;
    await supplier.save();

    try {
      await sendSupplierApprovalEmail({
        to: supplier.email, supplierName: supplier.contactPersonName,
        username: supplier.username, password: plainPassword,
        roleName: role.name, portalUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
      });
    } catch (mailErr) { console.error('Email send failed:', mailErr.message); }

    const updated = await Supplier.findById(supplier._id)
      .populate('role', 'name')
      .populate('approvedBy', 'firstName lastName')
      .select('-password');
    res.json({ success: true, message: 'Supplier approved and credentials sent via email', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const rejectSupplier = async (req, res) => {
  try {
    const { approvalNote } = req.body;
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    supplier.status       = 'rejected';
    supplier.approvalNote = approvalNote || '';
    supplier.rejectedBy   = req.user._id;
    supplier.rejectedAt   = new Date();
    await supplier.save({ validateBeforeSave: false });
    try {
      await sendSupplierRejectionEmail({ to: supplier.email, supplierName: supplier.contactPersonName, note: approvalNote });
    } catch (mailErr) { console.error('Email send failed:', mailErr.message); }
    res.json({ success: true, message: 'Supplier rejected and notified via email' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const toggleActive = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    supplier.isActive = !supplier.isActive;
    await supplier.save({ validateBeforeSave: false });
    res.json({ success: true, message: `Supplier ${supplier.isActive ? 'activated' : 'deactivated'}`, isActive: supplier.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const toggleLock = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    supplier.isLocked = !supplier.isLocked;
    await supplier.save({ validateBeforeSave: false });
    res.json({ success: true, message: `Supplier ${supplier.isLocked ? 'locked' : 'unlocked'}`, isLocked: supplier.isLocked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateSupplierRole = async (req, res) => {
  try {
    const { roleId } = req.body;
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    if (supplier.status !== 'approved') return res.status(400).json({ success: false, message: 'Supplier must be approved first' });
    const role = await Role.findById(roleId);
    if (!role || !role.isActive || role.isSuperAdmin)
      return res.status(400).json({ success: false, message: 'Invalid or inactive role' });
    supplier.role = roleId;
    await supplier.save({ validateBeforeSave: false });
    const updated = await Supplier.findById(supplier._id).populate('role', 'name').select('-password');
    res.json({ success: true, message: 'Supplier role updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllSuppliers, getApprovedSuppliers,
  getSupplierById,
  createSupplier, updateSupplier,
  approveSupplier, rejectSupplier,
  toggleActive, toggleLock,
  updateSupplierRole,
};
