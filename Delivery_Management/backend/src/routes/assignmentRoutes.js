// routes/assignmentRoutes.js
const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentControler');

// Start automatic assignment process
router.post('/start', assignmentController.startAssignment);

// Stop automatic assignment process
router.post('/stop', assignmentController.stopAssignment);

// Manually trigger assignment process once
router.post('/manual', assignmentController.manualAssignment);

module.exports = router;