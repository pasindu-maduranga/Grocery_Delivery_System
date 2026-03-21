const express = require('express');
const router = express.Router();
const {
  getAllRoles, getRoleById, createRole, updateRole, deleteRole,
  getRolePermissions, updateRolePermissions,
} = require('../Controllers/roleController');
const { authenticate, requireSuperAdmin } = require('../Middlewares/Auth');

// All role routes require super admin
router.use(authenticate, requireSuperAdmin);

router.get('/', getAllRoles);
router.post('/', createRole);
router.get('/:id', getRoleById);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

// Permission management
router.get('/:id/permissions', getRolePermissions);
router.put('/:id/permissions', updateRolePermissions);

module.exports = router;
