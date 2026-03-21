const express = require('express');
const router = express.Router();
const { authenticate } = require('../Middlewares/Auth');
const { sendToAdmin, getMySubmissions, getAllSubmissions, getSubmissionById, acceptSubmission, rejectSubmission } = require('../Controllers/grocerySubmissionController');

router.use(authenticate);

router.get('/my', getMySubmissions);
router.get('/', getAllSubmissions);
router.get('/:id', getSubmissionById);
router.post('/', sendToAdmin);
router.patch('/:id/accept', acceptSubmission);
router.patch('/:id/reject', rejectSubmission);

module.exports = router;
