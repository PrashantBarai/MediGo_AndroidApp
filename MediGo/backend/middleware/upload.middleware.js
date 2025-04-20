const multer = require('multer');
const B2 = require('backblaze-b2');
const path = require('path');

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

// Create a single B2 instance to reuse
let b2Instance = null;

// Function to get authorized B2 instance
const getB2Instance = async () => {
  if (!b2Instance) {
    b2Instance = new B2({
      applicationKeyId: process.env.B2_ACCOUNT_ID,
      applicationKey: process.env.B2_APPLICATION_KEY,
    });
    await b2Instance.authorize();
  }
  return b2Instance;
};

// Function to get authorized download URL
const getAuthorizedUrl = async (fileName) => {
  try {
    const b2 = await getB2Instance();
    const response = await b2.getDownloadAuthorization({
      bucketId: process.env.B2_BUCKET_ID,
      fileNamePrefix: fileName,
      validDurationInSeconds: 604800, // 7 days
    });

    const downloadUrl = `${process.env.B2_DOWNLOAD_URL}/file/${process.env.B2_BUCKET_NAME}/${fileName}?Authorization=${response.data.authorizationToken}`;
    return downloadUrl;
  } catch (error) {
    console.error('Error getting authorized URL:', error);
    throw error;
  }
};

// Middleware to upload multiple files to Backblaze B2
const uploadToB2 = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    console.log(`Uploading ${req.files.length} images to Backblaze B2...`);

    // Validate B2 credentials
    if (!process.env.B2_ACCOUNT_ID || !process.env.B2_APPLICATION_KEY || !process.env.B2_BUCKET_ID) {
      throw new Error('Missing B2 credentials. Please check your .env file');
    }

    // Get authorized B2 instance
    const b2 = await getB2Instance();

    // Upload all files - getting new upload URL for each file
    const uploadPromises = req.files.map(async (file) => {
      try {
        console.log('Processing file:', file.originalname);
        // Store in products subfolder with sanitized filename
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `products/${Date.now()}-${sanitizedName}`;
        
        // Get new upload URL for each file
        console.log('Getting upload URL for:', fileName);
        const uploadUrlResponse = await b2.getUploadUrl({
          bucketId: process.env.B2_BUCKET_ID,
        });
        console.log('Got upload URL for:', fileName);
        
        const uploadResponse = await b2.uploadFile({
          uploadUrl: uploadUrlResponse.data.uploadUrl,
          uploadAuthToken: uploadUrlResponse.data.authorizationToken,
          fileName: fileName,
          data: file.buffer,
          mime: file.mimetype,
        });

        console.log('Successfully uploaded file:', fileName);
        
        // Get authorized download URL
        const authorizedUrl = await getAuthorizedUrl(fileName);
        console.log('Generated authorized URL for:', fileName);
        return authorizedUrl;
      } catch (error) {
        console.error(`Failed to upload file ${file.originalname}:`, error);
        return null;
      }
    });

    // Wait for all uploads to complete
    const uploadedUrls = await Promise.all(uploadPromises);

    // Filter out failed uploads and add URLs to request body
    req.body.images = uploadedUrls.filter(url => url !== null);
    
    if (req.body.images.length === 0 && req.files.length > 0) {
      console.warn('Warning: No images were successfully uploaded to B2');
    } else {
      console.log(`Successfully uploaded ${req.body.images.length} of ${req.files.length} images`);
      console.log('Image URLs:', req.body.images);
    }

    next();
  } catch (error) {
    console.error('Error in uploadToB2:', error);
    next(error);
  }
};

// Function to delete file from B2
const deleteFileFromB2 = async (fileName) => {
  try {
    console.log('Deleting file from B2:', fileName);
    
    // Get authorized B2 instance
    const b2 = await getB2Instance();
    
    // List file versions to get the fileId
    const response = await b2.listFileVersions({
      bucketId: process.env.B2_BUCKET_ID,
      startFileName: fileName,
      maxFileCount: 1
    });

    if (!response.data.files || response.data.files.length === 0) {
      throw new Error('File not found');
    }

    const file = response.data.files[0];
    
    // Delete the file
    await b2.deleteFileVersion({
      fileId: file.fileId,
      fileName: fileName
    });

    console.log('Successfully deleted file:', fileName);
    return true;
  } catch (error) {
    console.error('Error deleting file from B2:', error);
    throw error;
  }
};

module.exports = { upload, uploadToB2, deleteFileFromB2 };
