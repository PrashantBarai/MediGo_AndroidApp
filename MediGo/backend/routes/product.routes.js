const express = require('express');
const router = express.Router();
const { upload, uploadToB2 } = require('../middleware/upload.middleware');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage
} = require('../controllers/product.controller');

// Firebase authentication will be added later

// Get all products
router.get('/', getProducts);

// Get a specific product
router.get('/:id', getProductById);

// Create a new product
router.post('/', upload.array('images'), uploadToB2, createProduct);

// Update a product
router.put('/:id', upload.array('images'), uploadToB2, updateProduct);

// Delete a product
router.delete('/:id', deleteProduct);

// Delete a product image
router.post('/delete-image', deleteProductImage);

module.exports = router;
