const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// ✅ GET all products with filtering
router.get('/', async (req, res) => {
  try {
    const { category, subcategory, subSubcategory } = req.query;
    const query = {};

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (subSubcategory) query.subSubcategory = subSubcategory;

    const products = await Product.find(query);
    
    // Convert image paths to relative URLs
    const productsWithUrls = products.map(product => {
      const productObj = product.toObject();
      if (productObj.image) {
        // Convert the stored path to a URL path
        productObj.image = productObj.image.replace(/\\/g, '/').replace('Backend/uploads/', '/uploads/');
      }
      return productObj;
    });

    res.status(200).json(productsWithUrls);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// ✅ GET a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const productObj = product.toObject();
    if (productObj.image) {
      // Convert the stored path to a URL path
      productObj.image = productObj.image.replace(/\\/g, '/').replace('Backend/uploads/', '/uploads/');
    }
    
    res.status(200).json(productObj);
  } catch (err) {
    res.status(500).json({ message: 'Error getting product' });
  }
});

// ✅ POST create a new product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const newProduct = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock || 0,
      subcategory: req.body.subcategory,
      subSubcategory: req.body.subSubcategory,
      image: req.file ? req.file.path : null
    });

    const savedProduct = await newProduct.save();
    
    // Convert the image path to a URL path
    const productObj = savedProduct.toObject();
    if (productObj.image) {
      productObj.image = productObj.image.replace(/\\/g, '/').replace('Backend/uploads/', '/uploads/');
    }
    
    res.status(201).json(productObj);
  } catch (err) {
    console.error('Create Product Error:', err);
    res.status(400).json({ message: 'Error creating product' });
  }
});

// ✅ PUT (update) a product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock,
      subcategory: req.body.subcategory,
      subSubcategory: req.body.subSubcategory
    };

    // Handle image update
    if (req.file) {
      // Delete old image if it exists
      const oldProduct = await Product.findById(req.params.id);
      if (oldProduct && oldProduct.image) {
        const oldImagePath = path.join(__dirname, '..', oldProduct.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = req.file.path;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });

    // Convert the image path to a URL path
    const productObj = updatedProduct.toObject();
    if (productObj.image) {
      productObj.image = productObj.image.replace(/\\/g, '/').replace('Backend/uploads/', '/uploads/');
    }

    res.status(200).json(productObj);
  } catch (err) {
    res.status(400).json({ message: 'Error updating product' });
  }
});

// ✅ DELETE a product
router.delete('/:id', async (req, res) => {
  try {
    // Get the product first to delete its image
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Delete the product's image if it exists
    if (product.image) {
      const imagePath = path.join(__dirname, '..', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete the product from the database
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

module.exports = router;
