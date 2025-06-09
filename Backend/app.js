// 1. Load required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 2. Create Express app
const app = express();

// 3. Middleware to allow other origins (like your frontend) to talk to backend
app.use(cors());

// 4. Middleware to parse JSON in requests (e.g. for login, forms)
app.use(express.json());

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
app.use(`${process.env.API_URL}/users`, userRoutes);


// 7. Export the app so server.js can use it
module.exports = app;
