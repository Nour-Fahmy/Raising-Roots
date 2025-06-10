const express = require('express');
const router = express.Router();
const expertApplicationController = require('../controllers/expertApplicationController');

// Route for submitting a new expert application
router.post('/apply', expertApplicationController.uploadCv, expertApplicationController.submitApplication);

// Route to get all expert applications (for admin)
router.get('/', expertApplicationController.getAllApplications);

// Route to update the status of an expert application (for admin)
router.patch('/:id/status', expertApplicationController.updateApplicationStatus);

module.exports = router; 