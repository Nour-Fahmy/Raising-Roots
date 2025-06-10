const express = require('express');
const router = express.Router();
const Expert = require('../models/expert');
const { body, validationResult } = require('express-validator');
const rateLimiter = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// Validation middleware for expert application
const validateExpertApplication = [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('phone').matches(/^01[0125][0-9]{8}$/).withMessage('Please enter a valid Egyptian phone number'),
    body('birthDate').isDate().withMessage('Please enter a valid birth date'),
    body('gender').isIn(['male', 'female']).withMessage('Please select a valid gender'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('governorate').trim().notEmpty().withMessage('Governorate is required'),
    body('education').trim().notEmpty().withMessage('Education details are required'),
    body('experience').trim().notEmpty().withMessage('Experience details are required'),
    body('specialization').trim().notEmpty().withMessage('Specialization is required'),
    body('certifications').isArray().withMessage('Certifications must be an array'),
    body('certifications.*.name').trim().notEmpty().withMessage('Certification name is required'),
    body('certifications.*.issuer').trim().notEmpty().withMessage('Certification issuer is required'),
    body('certifications.*.year').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Please enter a valid year'),
    body('languages').isArray().withMessage('Languages must be an array'),
    body('languages.*.language').trim().notEmpty().withMessage('Language is required'),
    body('languages.*.proficiency').isIn(['basic', 'intermediate', 'advanced', 'native']).withMessage('Please select a valid proficiency level'),
    body('availability').isArray().withMessage('Availability must be an array'),
    body('availability.*.day').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).withMessage('Please select a valid day'),
    body('availability.*.startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please enter a valid start time (HH:MM)'),
    body('availability.*.endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please enter a valid end time (HH:MM)'),
    body('consultationFee').isFloat({ min: 0 }).withMessage('Consultation fee must be a positive number'),
    body('paymentMethods').isArray().withMessage('Payment methods must be an array'),
    body('paymentMethods.*').isIn(['cash', 'credit_card', 'bank_transfer', 'mobile_payment']).withMessage('Please select valid payment methods'),
    body('bio').trim().notEmpty().withMessage('Bio is required'),
    body('socialMedia').optional().isObject().withMessage('Social media must be an object'),
    body('socialMedia.linkedin').optional().isURL().withMessage('Please enter a valid LinkedIn URL'),
    body('socialMedia.twitter').optional().isURL().withMessage('Please enter a valid Twitter URL'),
    body('socialMedia.instagram').optional().isURL().withMessage('Please enter a valid Instagram URL'),
    body('socialMedia.facebook').optional().isURL().withMessage('Please enter a valid Facebook URL'),
    body('socialMedia.website').optional().isURL().withMessage('Please enter a valid website URL'),
    body('termsAccepted').isBoolean().withMessage('Terms acceptance is required')
];

// Public Routes

// Submit expert application
router.post('/apply', rateLimiter, upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'certificates', maxCount: 5 }
]), validateExpertApplication, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // If there are validation errors, remove uploaded files
            if (req.files) {
                Object.values(req.files).forEach(files => {
                    files.forEach(file => {
                        fs.unlinkSync(file.path);
                    });
                });
            }
            return res.status(400).json({ errors: errors.array() });
        }

        // Handle file uploads
        const fileData = {};
        if (req.files) {
            if (req.files.profilePicture) {
                fileData.profilePicture = req.files.profilePicture[0].path;
            }
            if (req.files.certificates) {
                fileData.certificates = req.files.certificates.map(file => file.path);
            }
        }

        // Create new expert application with file data
        const expert = new Expert({
            ...req.body,
            ...fileData,
            status: 'pending' // Set initial status as pending
        });
        await expert.save();

        res.status(201).json({
            success: true,
            message: 'Expert application submitted successfully. We will review your application and get back to you soon.',
            data: expert
        });
    } catch (error) {
        // If there's an error, remove uploaded files
        if (req.files) {
            Object.values(req.files).forEach(files => {
                files.forEach(file => {
                    fs.unlinkSync(file.path);
                });
            });
        }
        console.error('Error submitting expert application:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting expert application',
            error: error.message
        });
    }
});

// Check application status
router.get('/status/:email', async (req, res) => {
    try {
        const expert = await Expert.findOne({ email: req.params.email });
        if (!expert) {
            return res.status(404).json({
                success: false,
                message: 'No application found with this email'
            });
        }
        res.status(200).json({
            success: true,
            data: {
                status: expert.status,
                submittedAt: expert.createdAt
            }
        });
    } catch (error) {
        console.error('Error checking application status:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking application status',
            error: error.message
        });
    }
});

// Admin Routes (protected with authentication middleware)
const adminRoutes = express.Router();

// Get all expert applications
adminRoutes.get('/applications', async (req, res) => {
    try {
        const experts = await Expert.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: experts
        });
    } catch (error) {
        console.error('Error fetching expert applications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching expert applications',
            error: error.message
        });
    }
});

// Get expert application by ID
adminRoutes.get('/applications/:id', async (req, res) => {
    try {
        const expert = await Expert.findById(req.params.id);
        if (!expert) {
            return res.status(404).json({
                success: false,
                message: 'Expert application not found'
            });
        }
        res.status(200).json({
            success: true,
            data: expert
        });
    } catch (error) {
        console.error('Error fetching expert application:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching expert application',
            error: error.message
        });
    }
});

// Update expert application status
adminRoutes.patch('/applications/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const expert = await Expert.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!expert) {
            return res.status(404).json({
                success: false,
                message: 'Expert application not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Expert application status updated successfully',
            data: expert
        });
    } catch (error) {
        console.error('Error updating expert application status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating expert application status',
            error: error.message
        });
    }
});

// Delete expert application
adminRoutes.delete('/applications/:id', async (req, res) => {
    try {
        const expert = await Expert.findById(req.params.id);
        if (!expert) {
            return res.status(404).json({
                success: false,
                message: 'Expert application not found'
            });
        }

        // Delete associated files
        if (expert.profilePicture) {
            fs.unlinkSync(expert.profilePicture);
        }
        if (expert.certificates && expert.certificates.length > 0) {
            expert.certificates.forEach(certificate => {
                fs.unlinkSync(certificate);
            });
        }

        // Delete the expert application
        await expert.remove();

        res.status(200).json({
            success: true,
            message: 'Expert application deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting expert application:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting expert application',
            error: error.message
        });
    }
});

// Mount admin routes
router.use('/admin', adminRoutes);

module.exports = router; 