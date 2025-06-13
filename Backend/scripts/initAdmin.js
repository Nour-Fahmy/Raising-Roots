const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Admin } = require('../models/admin');
require('dotenv').config();

async function initializeAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const adminExists = await Admin.findOne({ email: 'admin@raisingroots.com' });
        if (adminExists) {
            console.log('Admin user already exists');
            return;
        }

        // Create admin user with hashed password
        const passwordHash = await bcrypt.hash('Admin123!', 10);
        const admin = new Admin({
            username: 'Admin',
            email: 'admin@raisingroots.com',
            passwordHash,
            role: 'admin'
        });

        await admin.save();
        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await mongoose.disconnect();
    }
}

// Run the initialization
initializeAdmin(); 