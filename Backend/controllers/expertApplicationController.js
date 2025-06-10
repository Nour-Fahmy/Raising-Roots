const ExpertApplication = require('../models/ExpertApplication');
const multer = require('multer');
const path = require('path');

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Backend/uploads/cvs/'); // CVs will now be stored in Backend/uploads/cvs/
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Filter to allow only PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter, 
  limits: { fileSize: 10 * 1024 * 1024 } // Increased to 10MB limit
});

exports.uploadCv = upload.single('cv'); // Export Multer middleware

// Controller function to handle expert application submission
exports.submitApplication = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CV file is required.' });
    }

    const { name, email, number } = req.body;
    // Store a relative path to the CV file, consistent with static serving
    const cvFile = `uploads/cvs/${req.file.filename}`; 

    const newApplication = new ExpertApplication({
      name,
      email,
      number,
      cvFile
    });

    await newApplication.save();
    res.status(201).json({ message: 'Application submitted successfully!' });
  } catch (error) {
    if (error.code === 11000) { // Duplicate email error
      return res.status(400).json({ message: 'An application with this email already exists.' });
    }
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Controller function to get all applications (for admin dashboard)
exports.getAllApplications = async (req, res, next) => {
  try {
    const applications = await ExpertApplication.find({});
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error. Could not fetch applications.' });
  }
};

// Controller function to update application status (approve/reject)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const application = await ExpertApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    res.status(200).json({ message: 'Application status updated successfully.', application });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Server error. Could not update application status.' });
  }
}; 