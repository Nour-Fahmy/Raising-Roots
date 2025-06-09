const mongoose = require('mongoose');

// Define user structure (schema)
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user' // Can be 'user' or 'admin'
  },
  babyName: {
    type: String,
    required: true
  },
  babyGender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  }
});

// Create a real model from the schema
exports.User = mongoose.model('User', userSchema);
