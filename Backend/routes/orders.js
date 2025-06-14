const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const orderController = require('../controllers/orderController');

// Create order with auto-calculated total
router.post('/', async (req, res) => {
  try {
    const { user, products } = req.body;

    if (!user || !products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'Missing user or products array' });
    }

    // Step 1: Fetch real product prices
    let total = 0;
    const detailedProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.product}` });
      }

      const lineTotal = product.price * item.quantity;
      total += lineTotal;

      detailedProducts.push({
        product: product._id,
        quantity: item.quantity
      });
    }

    // Step 2: Create the order with the calculated total
    const order = new Order({
      user,
      products: detailedProducts,
      total
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);

  } catch (err) {
    console.error('Create Order Error:', err);
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

// Get all orders
router.get('/', orderController.getAllOrders);

// Route to get the total count of orders
router.get('/count', orderController.getOrderCount);

module.exports = router;
