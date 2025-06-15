const Order = require('../models/order');

// Get all orders with populated user and product details
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username email') // Populate user details
      .populate('products.product', 'name price image') // Populate product details
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error. Could not fetch orders.' });
  }
};

exports.getOrderCount = async (req, res, next) => {
  try {
    const count = await Order.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Error fetching order count:', error);
    res.status(500).json({ success: false, message: 'Server error. Could not fetch order count.' });
  }
}; 