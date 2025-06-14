const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models/user');
const { Admin } = require('../models/admin');
const { validateLogin } = require('../middleware/validation');
const { loginLimiter } = require('../middleware/rateLimiter');
const jwt = require('jsonwebtoken');
const { authenticateToken, isAdmin } = require('../middleware/auth');

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

// POST /api/v1/users/login
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // First check if it's an admin login
        const admin = await Admin.findOne({ email });
        if (admin) {
            const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
            if (isPasswordValid) {
                const token = jwt.sign(
                    {
                        userId: admin._id,
                        isAdmin: true,
                        role: 'admin'
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '1d' }
                );

                return res.status(200).json({
                    message: 'Admin login successful!',
                    token,
                    user: {
                        id: admin._id,
                        username: admin.username,
                        email: admin.email,
                        role: 'admin',
                        isAdmin: true
                    }
                });
            }
        }

        // If not admin or admin password incorrect, check regular users
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid credentials',
                errors: [{
                    field: 'email',
                    message: 'No account found with this email'
                }]
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Invalid credentials',
                errors: [{
                    field: 'password',
                    message: 'Incorrect password'
                }]
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                isAdmin: false,
                role: 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: 'user',
                isAdmin: false
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ 
            message: 'An error occurred during login',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
});

// GET /api/v1/users/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Admin routes for user management
// GET /api/v1/users - Get all users (admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { role } = req.query;
        const query = {};
        
        if (role && role !== 'all') {
            query.role = role;
        }

        const users = await User.find(query)
            .select('-passwordHash')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// PUT /api/v1/users/:id - Update user status (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Error updating user' });
    }
});

// DELETE /api/v1/users/:id - Delete user (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: null
        });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

module.exports = router;