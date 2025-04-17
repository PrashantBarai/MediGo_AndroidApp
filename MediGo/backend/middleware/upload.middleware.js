const multer = require('multer');
const { B2 } = require('backblaze-b2');
const path = require('path');

// Initialize Backblaze B2
const b2 = new B2({
  applicationKeyId: process.env.B2_ACCOUNT_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and JPG are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Middleware to upload file to Backblaze B2
const uploadToB2 = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    // Authorize with B2
    await b2.authorize();

    // Get upload URL
    const response = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID,
    });

    // Upload file
    const uploadResponse = await b2.uploadFile({
      uploadUrl: response.data.uploadUrl,
      uploadAuthToken: response.data.authorizationToken,
      fileName: `${Date.now()}-${req.file.originalname}`,
      content: req.file.buffer,
      mime: req.file.mimetype,
    });

    // Add file URL to request body
    req.body.image = `https://${process.env.B2_BUCKET_NAME}.s3.us-east-005.backblazeb2.com/${uploadResponse.data.fileName}`;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  uploadToB2,
};
