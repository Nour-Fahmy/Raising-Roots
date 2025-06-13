const mongoose = require('mongoose');
const Counter = require('./counter');

const productSchema = new mongoose.Schema({

  productId: {
    type: Number,
    unique: true,
    immutable: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required']
  },
  category: {
    type: String,
    required: [true, 'Product category is required']
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  image: {
    type: String,
    required: false
  },
  subcategory: {
    type: String,
    required: false
  },
  subSubcategory: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to auto-increment productId
productSchema.pre('save', async function(next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'productId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.productId = counter.seq;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);


module.exports = Product;