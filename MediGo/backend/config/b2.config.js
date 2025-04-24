require('dotenv').config();

module.exports = {
  accountId: process.env.B2_ACCOUNT_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
  applicationKeyName: process.env.B2_APPLICATION_KEY_NAME,
  bucketId: process.env.B2_BUCKET_ID,
  bucketName: process.env.B2_BUCKET_NAME,
  downloadUrl: 'https://f005.backblazeb2.com/file' // Default Backblaze download URL
};
