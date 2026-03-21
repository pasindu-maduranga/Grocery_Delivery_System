const express = require('express');
const router = express.Router();
const { authenticate, authorizeScreen } = require('../Middlewares/Auth');
const upload = require('../Config/multer');
const {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  approveSupplier,
  rejectSupplier,
  toggleActive,
  toggleLock,
  getApprovedSuppliers
  ,
} = require('../Controllers/Suppliercontroller');

const supplierUpload = upload.fields([
  { name: 'profilePic',      maxCount: 1 },
  { name: 'businessLogo',    maxCount: 1 },
  { name: 'businessLicense', maxCount: 1 },
  { name: 'taxCertificate',  maxCount: 1 },
  { name: 'bankStatement',   maxCount: 1 },
]);

router.use(authenticate, authorizeScreen);
router.get('/approved', authenticate, authorizeScreen, getApprovedSuppliers);  // managers
router.get('/',    getAllSuppliers);
router.get('/:id', getSupplierById);
router.post('/',   supplierUpload, createSupplier);
router.put('/:id', supplierUpload, updateSupplier);
router.get('/approved', authenticate, authorizeScreen, getApprovedSuppliers);


router.patch('/:id/approve',  approveSupplier);
router.patch('/:id/reject', rejectSupplier);
router.patch('/:id/toggle-active', toggleActive);
router.patch('/:id/toggle-lock', toggleLock);

module.exports = router;
