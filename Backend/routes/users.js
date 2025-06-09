const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models/user');

// POST /api/v1/users/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, babyName, babyGender, birthDate } = req.body;

    // Validate required fields
    if (!username || !email || !password || !babyName || !babyGender || !birthDate) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Encrypt password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      username,
      email,
      passwordHash,
      babyName,
      babyGender,
      birthDate
    });

    // Save to DB
    const savedUser = await newUser.save();

    // Respond
    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

//hena ana b add el login route

const jwt = require('jsonwebtoken');

// POST /api/v1/users/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // 2. Check the password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // 3. Generate a JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        isAdmin: user.role === 'admin',
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Token lasts for 1 day
    );

    // 4. Send token and basic user info
    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Something went wrong' });
  }
});

//hena ana b test el auth middleware
const authenticateToken = require('../middleware/auth');

router.get('/profile', authenticateToken, (req, res) => {
  res.status(200).json({
    message: 'You are authenticated!',
    user: req.user
  });
});



module.exports = router;
