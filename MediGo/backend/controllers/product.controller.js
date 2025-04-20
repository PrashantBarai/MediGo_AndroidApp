const Product = require('../models/product.model');
const User = require('../models/user.model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const b2Service = require('../services/b2.service');
const B2 = require('backblaze-b2');
const { deleteFileFromB2 } = require('../middleware/upload.middleware');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer for temporary storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Function to upload file to B2
const uploadToB2 = async (filePath, fileName) => {
  try {
    // Check if B2 credentials are configured
    if (!process.env.B2_ACCOUNT_ID || !process.env.B2_APPLICATION_KEY || !process.env.B2_BUCKET_ID) {
      console.error('B2 credentials not configured');
      throw new Error('B2 credentials not configured');
    }

    console.log('Starting B2 upload for file:', fileName);

    // Create a new B2 instance for this upload
    const b2 = new B2({
      applicationKeyId: process.env.B2_ACCOUNT_ID,
      applicationKey: process.env.B2_APPLICATION_KEY
    });

    // Authorize with B2
    console.log('Authorizing with B2...');
    const authResponse = await b2.authorize();
    if (!authResponse || !authResponse.data || !authResponse.data.authorizationToken) {
      throw new Error('Failed to authorize with B2');
    }
    console.log('B2 authorization successful');

    // Get upload URL and auth token
    console.log('Getting upload URL...');
    const { data: { uploadUrl, authorizationToken } } = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID
    });
    console.log('Got upload URL:', uploadUrl);

    // Read file
    console.log('Reading file:', filePath);
    const fileData = fs.readFileSync(filePath);
    console.log('File read successfully, size:', fileData.length);

    // Upload file
    console.log('Uploading file to B2...');
    const fileInfo = await b2.uploadFile({
      uploadUrl: uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: fileName,
      data: fileData
    });
    console.log('File uploaded successfully:', fileInfo.data.fileName);

    // Clean up temporary file
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Temporary file cleaned up:', filePath);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temporary file:', cleanupError);
      // Don't throw here as the upload was successful
    }

    // Return the file URL
    const fileUrl = `${process.env.B2_DOWNLOAD_URL}/${process.env.B2_BUCKET_NAME}/${fileInfo.data.fileName}`;
    console.log('Generated file URL:', fileUrl);
    return fileUrl;
  } catch (error) {
    console.error('Error in uploadToB2:', error);
    // Clean up temporary file even if upload fails
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Cleaned up temporary file after error:', filePath);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temporary file after upload error:', cleanupError);
    }
    throw new Error(`Failed to upload file to B2: ${error.message}`);
  }
};

// Helper function to ensure JSON response
const sendJsonResponse = (res, status, data) => {
  res.setHeader('Content-Type', 'application/json');
  return res.status(status).json(data);
};

// Error handling middleware
const handleError = (error, req, res, next) => {
  console.error('Error:', error);
  return sendJsonResponse(res, error.status || 500, {
    success: false,
    message: error.message || 'Internal server error'
  });
};

// Export error handling middleware
module.exports.handleError = handleError;

// Export all controller functions
module.exports = {
  createProduct: async (req, res) => {
    try {
      console.log('Received request body:', req.body);
      console.log('Received files:', req.files);
      
      let productData;
      let existingImages = [];
      
      // Handle FormData
      if (req.body.productData) {
        try {
          // Check if productData is a string that needs parsing
          if (typeof req.body.productData === 'string') {
            productData = JSON.parse(req.body.productData);
          } else {
            productData = req.body.productData;
          }
          
          // Parse existing images if provided
          if (req.body.existingImages) {
            if (typeof req.body.existingImages === 'string') {
              existingImages = JSON.parse(req.body.existingImages);
            } else {
              existingImages = req.body.existingImages;
            }
          }
  } catch (error) {
          console.error('Error parsing product data:', error);
          return res.status(400).json({
            success: false,
            message: 'Invalid product data format: ' + error.message
          });
        }
      } else {
        // If not FormData, use body directly
        productData = req.body;
      }
      
      // Log the parsed product data
      console.log('Parsed product data:', productData);
      
      // Validate product data
      if (!productData) {
        return res.status(400).json({
          success: false,
          message: 'Product data is required'
        });
      }
      
      // Parse discount if it's a string
      if (typeof productData.discount === 'string') {
        try {
          productData.discount = JSON.parse(productData.discount);
        } catch (error) {
          console.error('Error parsing discount:', error);
          productData.discount = { percentage: 0, validUntil: '' };
        }
      }

      // Fix ingredients serialization
      if (typeof productData.ingredients === 'string') {
        try {
          // First parse the string to get the array
          let ingredientsArray = JSON.parse(productData.ingredients);
          
          // If it's an array, clean each ingredient
          if (Array.isArray(ingredientsArray)) {
            ingredientsArray = ingredientsArray.map(ing => {
              if (typeof ing === 'string') {
                // Remove all extra brackets and slashes
                return ing.replace(/[\[\]\\"]/g, '').trim();
              }
              return ing;
            }).filter(ing => ing && ing.trim() !== '');
          }
          
          productData.ingredients = ingredientsArray;
        } catch (error) {
          console.error('Error parsing ingredients:', error);
          productData.ingredients = [];
        }
      }

      // Validate required fields
      const requiredFields = ['name', 'description', 'price', 'manufacturer', 'category', 'manufacturingDate'];
      const missingFields = requiredFields.filter(field => !productData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }
      
      // Check if validUntil is missing in discount
      if (!productData.discount || !productData.discount.validUntil) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: discount.validUntil'
        });
      }

      // Use images from req.body.images (uploaded by middleware)
      if (req.body.images && Array.isArray(req.body.images)) {
        productData.images = [...existingImages, ...req.body.images];
      } else {
        productData.images = existingImages;
      }

      // Create and save the product
      const product = new Product(productData);
      await product.save();
      
      console.log('Product saved to MongoDB successfully');

      // Return response with appropriate message
      return res.status(201).json({
        success: true,
        product: product,
        message: 'Product created successfully'
      });
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating product: ' + error.message
      });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const productId = req.params.id;
      console.log('Received update request for product ID:', productId);
      console.log('Received request body:', req.body);
      console.log('Received files:', req.files);
      
      let productData;
      let existingImages = [];
      
      // Handle FormData
      if (req.body.productData) {
        try {
          // Check if productData is a string that needs parsing
          if (typeof req.body.productData === 'string') {
            productData = JSON.parse(req.body.productData);
          } else {
            productData = req.body.productData;
          }
          
          // Parse existing images if provided
          if (req.body.existingImages) {
            if (typeof req.body.existingImages === 'string') {
              existingImages = JSON.parse(req.body.existingImages);
            } else {
              existingImages = req.body.existingImages;
            }
          }
        } catch (error) {
          console.error('Error parsing product data:', error);
          return res.status(400).json({
            success: false,
            message: 'Invalid product data format: ' + error.message
          });
        }
      } else {
        // If not FormData, use body directly
        productData = req.body;
      }
      
      // Log the parsed product data
      console.log('Parsed product data:', productData);
      
      // Validate product data
      if (!productData) {
        return res.status(400).json({
          success: false,
          message: 'Product data is required'
        });
      }
      
      // Parse discount if it's a string
      if (typeof productData.discount === 'string') {
        try {
          productData.discount = JSON.parse(productData.discount);
        } catch (error) {
          console.error('Error parsing discount:', error);
          productData.discount = { percentage: 0, validUntil: '' };
        }
      }

      // Fix ingredients serialization
      if (typeof productData.ingredients === 'string') {
        try {
          // First parse the string to get the array
          let ingredientsArray = JSON.parse(productData.ingredients);
          
          // If it's an array, clean each ingredient
          if (Array.isArray(ingredientsArray)) {
            ingredientsArray = ingredientsArray.map(ing => {
              if (typeof ing === 'string') {
                // Remove all extra brackets and slashes
                return ing.replace(/[\[\]\\"]/g, '').trim();
              }
              return ing;
            }).filter(ing => ing && ing.trim() !== '');
          }
          
          productData.ingredients = ingredientsArray;
        } catch (error) {
          console.error('Error parsing ingredients:', error);
          productData.ingredients = [];
        }
      }

      // Validate required fields
      const requiredFields = ['name', 'description', 'price', 'manufacturer', 'category', 'manufacturingDate'];
      const missingFields = requiredFields.filter(field => !productData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }
      
      // Check if validUntil is missing in discount
      if (!productData.discount || !productData.discount.validUntil) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: discount.validUntil'
        });
      }

      // Find existing product
      const currentProduct = await Product.findById(productId);
      if (!currentProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Handle images properly
      if (req.body.images && Array.isArray(req.body.images)) {
        // Get existing images from the product
        const currentImages = currentProduct.images || [];
        
        // Combine existing images with new images
        productData.images = [...currentImages, ...req.body.images];
        console.log('Combined images:', productData.images);
      } else {
        // If no new images, keep existing images
        productData.images = currentProduct.images || [];
      }

      // Check if there are any changes to update
      const hasChanges = Object.keys(productData).some(key => {
        // Skip _id field as it's not a changeable field
        if (key === '_id') return false;
        
        // For arrays like images, compare length and content
        if (Array.isArray(productData[key])) {
          if (!currentProduct[key] || currentProduct[key].length !== productData[key].length) return true;
          return JSON.stringify(currentProduct[key]) !== JSON.stringify(productData[key]);
        }
        
        // For objects like discount, compare stringified versions
        if (typeof productData[key] === 'object' && productData[key] !== null) {
          return JSON.stringify(currentProduct[key]) !== JSON.stringify(productData[key]);
        }
        
        // For primitive values, direct comparison
        return currentProduct[key] !== productData[key];
      });

      if (!hasChanges && (!req.body.images || req.body.images.length === 0)) {
        return res.status(200).json({
          success: true,
          message: 'No changes detected. Product not updated.',
          product: currentProduct
        });
      }

      // Update product
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        productData,
        { new: true, runValidators: true }
      );

      console.log('Product updated in MongoDB successfully');

      // Return response with appropriate message
      return res.status(200).json({
        success: true,
        product: updatedProduct,
        message: 'Product updated successfully'
      });
    } catch (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating product: ' + error.message
      });
    }
  },

  getProducts: async (req, res) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({ message: 'Error getting products' });
    }
  },

  getProductById: async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
      res.json(product);
    } catch (error) {
      console.error('Error getting product:', error);
      res.status(500).json({ message: 'Error getting product' });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const productId = req.params.id;
      console.log('Deleting product with ID:', productId);

      // Find the product first
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ 
          success: false,
          message: 'Product not found' 
        });
      }

      // Delete images from Backblaze if they exist
      if (product.images && product.images.length > 0) {
        console.log('Deleting images from Backblaze:', product.images);
        for (const imageUrl of product.images) {
          try {
            // Extract filename from the URL
            const fileName = imageUrl.split('/').pop().split('?')[0];
            if (!fileName) {
              console.error('Invalid image URL:', imageUrl);
              continue;
            }

            // Delete file from Backblaze
            await deleteFileFromB2(`products/${fileName}`);
            console.log('Successfully deleted image from Backblaze:', fileName);
          } catch (error) {
            console.error('Error deleting image from Backblaze:', error);
            // Continue with other images even if one fails
          }
        }
      }

      // Delete product from MongoDB
      await Product.findByIdAndDelete(productId);
      console.log('Successfully deleted product from MongoDB');

      return res.status(200).json({
        success: true,
        message: 'Product and its images deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting product: ' + error.message
      });
    }
  },

  // Helper functions
  uploadToB2,
  sendJsonResponse,
  handleError,

  // Helper function to delete file from B2
  deleteFileFromB2,

  // Add new endpoint to delete image
  deleteProductImage: async (req, res) => {
    try {
      const { productId, imageUrl } = req.body;
      
      if (!productId || !imageUrl) {
        return res.status(400).json({
          success: false,
          message: 'Product ID and image URL are required'
        });
      }

      // Find the product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // First update MongoDB to remove the image URL
      const originalImages = [...product.images]; // Keep a copy of original images
      product.images = product.images.filter(img => img !== imageUrl);
      
      try {
        // Save the product with updated images array
        await product.save();

        // Only after successful MongoDB update, delete from B2
        try {
          // Extract filename from the URL
          const fileName = imageUrl.split('/').pop().split('?')[0];
          if (!fileName) {
            throw new Error('Invalid image URL');
          }

          // Delete file from B2
          await deleteFileFromB2(`products/${fileName}`);
        } catch (b2Error) {
          // If B2 deletion fails, revert MongoDB changes
          console.error('Error deleting from B2:', b2Error);
          product.images = originalImages;
          await product.save();
          throw new Error('Failed to delete image from storage');
        }

        return res.status(200).json({
          success: true,
          message: 'Image deleted successfully',
          images: product.images
        });
      } catch (mongoError) {
        console.error('Error updating product in MongoDB:', mongoError);
        return res.status(500).json({
          success: false,
          message: 'Failed to update product'
        });
      }
  } catch (error) {
      console.error('Error deleting product image:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting image: ' + error.message
      });
    }
  }
};

// Helper function to validate date format (dd-mm-yyyy)
const isValidDateFormat = (dateStr) => {
  return /^\d{2}-\d{2}-\d{4}$/.test(dateStr);
};

// Helper function to validate if a date string is a valid date
const isValidDate = (dateStr) => {
  if (!isValidDateFormat(dateStr)) return false;
  
  const [day, month, year] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.getDate() === day &&
         date.getMonth() === month - 1 &&
         date.getFullYear() === year;
};

// Helper function to convert date from dd-mm-yyyy to ISO format
const convertDateToISO = (dateStr) => {
  if (!dateStr) return '';
  
  // Check if already in ISO format (yyyy-mm-dd)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Parse dd-mm-yyyy format
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const day = parts[0];
  const month = parts[1];
  const year = parts[2];
  
  return `${year}-${month}-${day}`;
};

// Helper function to convert date from ISO format to dd-mm-yyyy
const convertDateToDisplay = (dateStr) => {
  if (!dateStr) return '';
  
  // Check if already in dd-mm-yyyy format
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Parse yyyy-mm-dd format
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  
  return `${day}-${month}-${year}`;
};