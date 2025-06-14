const { User } = require('../models/user');

exports.getUserCount = async (req, res, next) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Error fetching user count:', error);
    res.status(500).json({ success: false, message: 'Server error. Could not fetch user count.' });
  }
}; 