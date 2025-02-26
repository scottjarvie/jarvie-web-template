/**
 * Backblaze B2 Storage Service
 * 
 * A service to handle file storage operations with Backblaze B2 using the AWS S3 SDK.
 * This service provides functions for uploading, downloading, deleting, and listing files.
 */

import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { logger } from "@repo/logs";

// Environment variables for Backblaze B2 configuration
const B2_KEY_ID = process.env.B2_KEY_ID || '';
const B2_KEY_SECRET = process.env.B2_KEY_SECRET || '';
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME || '';
const B2_REGION = process.env.B2_REGION || '';
const B2_ENDPOINT = process.env.B2_ENDPOINT || '';

// Check if all required environment variables are set
if (!B2_KEY_ID || !B2_KEY_SECRET || !B2_BUCKET_NAME || !B2_REGION || !B2_ENDPOINT) {
  logger.warn("Missing Backblaze B2 environment variables. Storage service will not function properly.");
}

// Initialize S3 client for Backblaze B2
const s3Client = new S3Client({
  region: B2_REGION,
  endpoint: `https://${B2_ENDPOINT}`,
  credentials: {
    accessKeyId: B2_KEY_ID,
    secretAccessKey: B2_KEY_SECRET,
  },
});

/**
 * Generate a unique file key for storage
 * @param fileName Original file name
 * @param userId User ID (optional)
 * @returns Unique file key
 */
const generateFileKey = (fileName: string, userId?: string): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const userPrefix = userId ? `${userId}/` : '';
  return `${userPrefix}${timestamp}_${sanitizedFileName}`;
};

/**
 * Upload a file to Backblaze B2
 * @param fileBuffer File buffer to upload
 * @param fileName Original file name
 * @param contentType MIME type of the file
 * @param userId User ID (optional)
 * @returns Object with file URL and key
 */
const uploadFile = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  userId?: string
): Promise<{ url: string; key: string }> => {
  try {
    const fileKey = generateFileKey(fileName, userId);
    
    const uploadParams = {
      Bucket: B2_BUCKET_NAME,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: contentType,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    
    // Construct the public URL
    const fileUrl = `https://${B2_ENDPOINT}/file/${B2_BUCKET_NAME}/${fileKey}`;
    
    return { url: fileUrl, key: fileKey };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error("Error uploading file to Backblaze B2:", error);
    throw new Error(`Failed to upload file: ${errorMessage}`);
  }
};

/**
 * Generate a presigned URL for uploading a file directly
 */
const getPresignedUploadUrl = async (
  fileName: string,
  contentType: string,
  userId?: string,
  expiresIn = 3600
): Promise<{ presignedUrl: string; key: string }> => {
  try {
    const fileKey = generateFileKey(fileName, userId);
    
    const command = new PutObjectCommand({
      Bucket: B2_BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    
    return { presignedUrl, key: fileKey };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error("Error generating presigned upload URL:", error);
    throw new Error(`Failed to generate presigned URL: ${errorMessage}`);
  }
};

/**
 * Generate a presigned URL for downloading a file
 */
const getPresignedDownloadUrl = async (
  fileKey: string,
  expiresIn = 3600
): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: B2_BUCKET_NAME,
      Key: fileKey,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return presignedUrl;
  } catch (error) {
    logger.error("Error generating presigned download URL:", error);
    throw error;
  }
};

/**
 * Delete a file from Backblaze B2
 */
const deleteFile = async (fileKey: string): Promise<boolean> => {
  try {
    const deleteParams = {
      Bucket: B2_BUCKET_NAME,
      Key: fileKey,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
    return true;
  } catch (error) {
    logger.error("Error deleting file from Backblaze B2:", error);
    throw error;
  }
};

/**
 * Check if a file exists in Backblaze B2
 */
const fileExists = async (fileKey: string): Promise<boolean> => {
  try {
    const headParams = {
      Bucket: B2_BUCKET_NAME,
      Key: fileKey,
    };

    await s3Client.send(new HeadObjectCommand(headParams));
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFound') {
      return false;
    }
    logger.error("Error checking if file exists:", error);
    throw error;
  }
};

/**
 * List files in a directory (prefix) in Backblaze B2
 */
const listFiles = async (prefix: string, maxKeys = 1000): Promise<any[]> => {
  try {
    const listParams = {
      Bucket: B2_BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: maxKeys,
    };

    const response = await s3Client.send(new ListObjectsV2Command(listParams));
    return response.Contents || [];
  } catch (error) {
    logger.error("Error listing files from Backblaze B2:", error);
    throw error;
  }
};

/**
 * Get a public URL for a file in Backblaze B2
 */
const getPublicUrl = (fileKey: string): string => {
  return `https://${B2_ENDPOINT}/file/${B2_BUCKET_NAME}/${fileKey}`;
};

// Export the service
export const backblazeStorageService = {
  uploadFile,
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  deleteFile,
  fileExists,
  listFiles,
  getPublicUrl,
  generateFileKey,
}; 