const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema({
    // Personal Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters long'],
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters long'],
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number']
    },
    areaOfExpertise: {
        type: String,
        required: [true, 'Area of expertise is required'],
        trim: true
    },

    // Professional Information
    currentPosition: {
        type: String,
        required: [true, 'Current position is required'],
        trim: true
    },
    yearsOfExperience: {
        type: Number,
        required: [true, 'Years of experience is required'],
        min: [0, 'Years of experience cannot be negative'],
        max: [50, 'Years of experience cannot exceed 50']
    },
    professionalLicenseNumber: {
        type: String,
        required: [true, 'Professional license number is required'],
        trim: true,
        unique: true
    },

    // Qualifications
    qualifications: [{
        degree: {
            type: String,
            required: true,
            trim: true
        },
        institution: {
            type: String,
            required: true,
            trim: true
        },
        year: {
            type: Number,
            required: true,
            min: [1900, 'Year must be after 1900'],
            max: [new Date().getFullYear(), 'Year cannot be in the future']
        }
    }],

    // Work Experience
    workExperience: [{
        position: {
            type: String,
            required: true,
            trim: true
        },
        organization: {
            type: String,
            required: true,
            trim: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        }
    }],

    // Documents
    documents: {
        professionalLicense: {
            type: String, // URL or path to stored file
            required: [true, 'Professional license document is required']
        },
        certifications: [{
            type: String // URLs or paths to stored files
        }],
        cv: {
            type: String, // URL or path to stored file
            required: [true, 'CV/Resume is required']
        }
    },

    // Additional Information
    professionalBio: {
        type: String,
        required: [true, 'Professional bio is required'],
        trim: true,
        minlength: [100, 'Professional bio must be at least 100 characters long'],
        maxlength: [1000, 'Professional bio cannot exceed 1000 characters']
    },
    areasOfSpecialization: [{
        type: String,
        trim: true
    }],
    availability: {
        type: String,
        required: [true, 'Availability information is required'],
        trim: true
    },

    // Application Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    applicationDate: {
        type: Date,
        default: Date.now
    },
    reviewDate: {
        type: Date
    },
    reviewNotes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Add indexes for frequently queried fields
expertSchema.index({ email: 1 });
expertSchema.index({ professionalLicenseNumber: 1 });
expertSchema.index({ status: 1 });
expertSchema.index({ applicationDate: 1 });

const Expert = mongoose.model('Expert', expertSchema);

module.exports = Expert; 