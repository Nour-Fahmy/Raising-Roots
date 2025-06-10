// 1. Load required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 2. Create Express app
const app = express();

// 3. Middleware to allow other origins (like your frontend) to talk to backend
app.use(cors());

// 4. Middleware to parse JSON in requests (e.g. for login, forms)
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// 6. Define a basic test route to check if backend is running
app.get('/api/v1/ping', (req, res) => {
  res.send({ message: 'Backend is alive!' });
});

// User routes
const userRoutes = require('./routes/users');
const expertRoutes = require('./routes/experts');
app.use(`${process.env.API_URL}/users`, userRoutes);
app.use(`${process.env.API_URL}/experts`, expertRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 7. Export the app so server.js can use it
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
