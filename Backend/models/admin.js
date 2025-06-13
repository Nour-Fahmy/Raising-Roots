const mongoose = require('mongoose');

// Define admin structure (schema)
const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        default: 'Admin'
    },
    email: {
        type: String,
        required: true,
        unique: true,
        default: 'admin@raisingroots.com'
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin'
    }
});

// Create a real model from the schema
exports.Admin = mongoose.model('Admin', adminSchema); 