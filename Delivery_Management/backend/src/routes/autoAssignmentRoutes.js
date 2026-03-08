const express = require('express');
const router = express.Router();
const autoAssignmentController = require('../controllers/autoAssignmentController');

// Start automatic assignment process
router.post('/assignment/start', autoAssignmentController.startAssignment);

// Stop automatic assignment process
router.post('/assignment/stop', autoAssignmentController.stopAssignment);

// Manually trigger assignment
router.post('/assignment/trigger', autoAssignmentController.manualAssignment);

module.exports = router;