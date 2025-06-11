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

// Serve static files from the 'pages' directory
app.use(express.static(path.join(__dirname, '../pages')));

// Serve other static assets
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use('/components', express.static(path.join(__dirname, '../components')));

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
const expertApplicationRoutes = require('./routes/expertApplications');
const postRoutes = require('./routes/posts');
// const expertRoutes = require('./routes/experts'); // Removed expert routes
app.use(`${process.env.API_URL}/users`, userRoutes);
app.use(`${process.env.API_URL}/experts`, expertApplicationRoutes);
app.use(`${process.env.API_URL}/posts`, postRoutes);
// app.use(`${process.env.API_URL}/experts`, expertRoutes); // Removed expert routes

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const productRoutes = require('./routes/products');
app.use('/api/v1/products', productRoutes);


module.exports = app;
