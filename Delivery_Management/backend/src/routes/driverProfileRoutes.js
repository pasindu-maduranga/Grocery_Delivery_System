// routes/driverProfileRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/driverProfileController');

// GET    /api/drivers/profile/:driverId          — full profile by MongoDB _id
router.get('/profile/:driverId',           ctrl.getProfile);

// GET    /api/drivers/profile/user/:userId       — profile by auth userId
router.get('/profile/user/:userId',        ctrl.getProfileByUserId);

// PUT    /api/drivers/profile/:driverId          — update name/email/phone/vehicle etc.
router.put('/profile/:driverId',           ctrl.updateProfile);

// PATCH  /api/drivers/profile/:driverId/toggle   — activate / deactivate driver
router.patch('/profile/:driverId/toggle',  ctrl.toggleActiveStatus);

// GET    /api/drivers/profile/:driverId/stats    — stats summary for profile page
router.get('/profile/:driverId/stats',     ctrl.getDriverStats);

// PUT    /api/drivers/profile/:driverId/location — update GPS location
router.put('/profile/:driverId/location',  ctrl.updateLocation);

module.exports = router;