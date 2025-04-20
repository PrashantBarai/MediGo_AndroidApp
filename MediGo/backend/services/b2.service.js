const B2 = require('backblaze-b2');

// Test B2 connection
const testB2Connection = async () => {
  try {
    // Validate B2 credentials
    if (!process.env.B2_ACCOUNT_ID || !process.env.B2_APPLICATION_KEY || !process.env.B2_BUCKET_ID) {
      console.error('❌ Backblaze B2: Missing credentials. Please check your .env file');
      return false;
    }

    // Create a new B2 instance for testing
    const b2 = new B2({
      applicationKeyId: process.env.B2_ACCOUNT_ID,
      applicationKey: process.env.B2_APPLICATION_KEY
    });

    // Authorize with B2
    const authResponse = await b2.authorize();
    if (authResponse && authResponse.data && authResponse.data.authorizationToken) {
      console.log('✅ Backblaze B2: Successfully connected and authorized');
      return true;
    } else {
      console.error('❌ Backblaze B2: Authorization failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Backblaze B2 connection error:', error.message);
    return false;
  }
};

// Upload file to B2
const uploadFile = async (file) => {
  try {
    // Validate B2 credentials
    if (!process.env.B2_ACCOUNT_ID || !process.env.B2_APPLICATION_KEY || !process.env.B2_BUCKET_ID) {
      throw new Error('Missing B2 credentials. Please check your .env file');
    }

    // Create a new B2 instance for this upload
    const b2 = new B2({
      applicationKeyId: process.env.B2_ACCOUNT_ID,
      applicationKey: process.env.B2_APPLICATION_KEY
    });

    // Authorize with B2
    const authResponse = await b2.authorize();
    if (!authResponse || !authResponse.data || !authResponse.data.authorizationToken) {
      throw new Error('Failed to authorize with B2');
    }
    
    // Get upload URL
    const { data: { uploadUrl, authorizationToken } } = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID
    });
    
    // Upload the file
    const fileName = `products/${Date.now()}-${file.originalname}`;
    const response = await b2.uploadFile({
      uploadUrl: uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: fileName,
      data: file.buffer,
      contentType: file.mimetype
    });
    
    // Return the public URL
    return `${process.env.B2_DOWNLOAD_URL}/${process.env.B2_BUCKET_NAME}/${fileName}`;
  } catch (error) {
    console.error('B2 upload error:', error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  testB2Connection
};
