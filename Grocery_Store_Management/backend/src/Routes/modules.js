const express = require('express');
const router = express.Router();
const {
  getAllParentMenus, createParentMenu, updateParentMenu, toggleParentMenuActive,
  getAllMenus, createMenu, updateMenu, toggleMenuActive,
  getAllScreens, createScreen, updateScreen, toggleScreenActive,
  getFullModuleStructure,
} = require('../Controllers/moduleController');
const { authenticate, requireSuperAdmin } = require('../Middlewares/Auth');

// All module management routes require super admin
router.use(authenticate, requireSuperAdmin);

// Full structure (for permission panel)
router.get('/structure', getFullModuleStructure);

// Parent Menus
router.get('/parent-menus', getAllParentMenus);
router.post('/parent-menus', createParentMenu);
router.put('/parent-menus/:id', updateParentMenu);
router.patch('/parent-menus/:id/toggle', toggleParentMenuActive);

// Menus
router.get('/menus', getAllMenus);
router.post('/menus', createMenu);
router.put('/menus/:id', updateMenu);
router.patch('/menus/:id/toggle', toggleMenuActive);

// Screens
router.get('/screens', getAllScreens);
router.post('/screens', createScreen);
router.put('/screens/:id', updateScreen);
router.patch('/screens/:id/toggle', toggleScreenActive);

module.exports = router;
