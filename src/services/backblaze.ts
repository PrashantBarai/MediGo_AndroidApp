import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

// Access environment variables
const {
  B2_ACCOUNT_ID,
  B2_APPLICATION_KEY,
  B2_BUCKET_ID,
  B2_BUCKET_NAME
} = Constants.expoConfig?.extra || {};

// Backblaze B2 API endpoints
const B2_API_URL = 'https://api.backblazeb2.com';
const B2_AUTH_URL = `${B2_API_URL}/b2api/v2/b2_authorize_account`;

interface AuthResponse {
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
}

interface UploadUrlResponse {
  uploadUrl: string;
  authorizationToken: string;
}

export const backblazeService = {
  // Authorize with Backblaze B2
  authorize: async (): Promise<AuthResponse> => {
    try {
      const authString = `${B2_ACCOUNT_ID}:${B2_APPLICATION_KEY}`;
      const encodedAuth = Buffer.from(authString).toString('base64');
      
      const response = await axios.get(B2_AUTH_URL, {
        headers: {
          Authorization: `Basic ${encodedAuth}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('B2 Authorization Error:', error);
      throw new Error('Failed to authorize with Backblaze B2');
    }
  },
  
  // Get upload URL
  getUploadUrl: async (authToken: string, apiUrl: string): Promise<UploadUrlResponse> => {
    try {
      const response = await axios.post(
        `${apiUrl}/b2api/v2/b2_get_upload_url`,
        { bucketId: B2_BUCKET_ID },
        {
          headers: {
            Authorization: authToken
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Get Upload URL Error:', error);
      throw new Error('Failed to get upload URL from Backblaze B2');
    }
  },
  
  // Upload file to Backblaze B2
  uploadFile: async (fileUri: string, fileName: string, fileType: string = 'image/jpeg'): Promise<string> => {
    try {
      // Authorize
      const authResponse = await backblazeService.authorize();
      
      // Get upload URL
      const uploadUrlResponse = await backblazeService.getUploadUrl(
        authResponse.authorizationToken,
        authResponse.apiUrl
      );
      
      // Read file
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }
      
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // Upload file
      const response = await axios.post(
        uploadUrlResponse.uploadUrl,
        Buffer.from(fileContent, 'base64'),
        {
          headers: {
            Authorization: uploadUrlResponse.authorizationToken,
            'Content-Type': fileType,
            'Content-Length': fileInfo.size,
            'X-Bz-File-Name': encodeURIComponent(fileName),
            'X-Bz-Content-Sha1': 'do_not_verify' // In production, calculate actual SHA1
          }
        }
      );
      
      // Return the download URL
      const fileId = response.data.fileId;
      return `${authResponse.downloadUrl}/file/${B2_BUCKET_NAME}/${encodeURIComponent(fileName)}`;
    } catch (error) {
      console.error('File Upload Error:', error);
      throw new Error('Failed to upload file to Backblaze B2');
    }
  },
  
  // Upload prescription image
  uploadPrescription: async (fileUri: string, orderId: string): Promise<string> => {
    const fileName = `prescriptions/${orderId}_${Date.now()}.jpg`;
    return backblazeService.uploadFile(fileUri, fileName);
  },
  
  // Upload product image
  uploadProductImage: async (fileUri: string, productId: string): Promise<string> => {
    const fileName = `products/${productId}_${Date.now()}.jpg`;
    return backblazeService.uploadFile(fileUri, fileName);
  },
  
  // Upload profile image
  uploadProfileImage: async (fileUri: string, userId: string): Promise<string> => {
    const fileName = `profiles/${userId}_${Date.now()}.jpg`;
    return backblazeService.uploadFile(fileUri, fileName);
  }
};

export default backblazeService;
