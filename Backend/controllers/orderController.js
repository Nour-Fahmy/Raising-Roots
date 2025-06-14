const Order = require('../models/order');

exports.getOrderCount = async (req, res, next) => {
  try {
    const count = await Order.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Error fetching order count:', error);
    res.status(500).json({ success: false, message: 'Server error. Could not fetch order count.' });
  }
}; 