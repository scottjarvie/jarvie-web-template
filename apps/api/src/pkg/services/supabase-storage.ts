/**
 * Supabase Storage Service
 * 
 * A service for interacting with Supabase Storage to handle file uploads,
 * downloads, and other storage operations.
 */

import { createClient } from "@supabase/supabase-js";
import { logger } from "@repo/logs";

// Environment variables for Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';

// Check if all required environment variables are set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
  logger.warn("Missing Supabase environment variables");
}

// Initialize Supabase client with service role for admin operations
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Generate a unique file key for storage
 */
const generateFileKey = (fileName: string, userId?: string): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const userPrefix = userId ? `${userId}/` : '';
  return `${userPrefix}${timestamp}_${sanitizedFileName}`;
};

/**
 * Generate a signed URL for uploading a file directly to Supabase Storage
 */
const getSignedUploadUrl = async (
  fileName: string,
  contentType: string,
  userId?: string
): Promise<{ signedUrl: string; key: string }> => {
  try {
    const fileKey = generateFileKey(fileName, userId);
    
    const { data, error } = await supabaseAdmin
      .storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(fileKey);
    
    if (error) {
      logger.error("Error generating signed upload URL:", error);
      throw error;
    }
    
    return { 
      signedUrl: data.signedUrl, 
      key: fileKey 
    };
  } catch (error) {
    logger.error("Error generating signed upload URL:", error);
    throw new Error(`Failed to generate signed URL: ${error}`);
  }
};

/**
 * Get a public URL for a file
 */
const getPublicUrl = (fileKey: string): string => {
  const { data } = supabaseAdmin
    .storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(fileKey);
  
  return data.publicUrl;
};

/**
 * Delete a file from storage
 */
const deleteFile = async (fileKey: string): Promise<boolean> => {
  try {
    const { error } = await supabaseAdmin
      .storage
      .from(STORAGE_BUCKET)
      .remove([fileKey]);
    
    if (error) {
      logger.error("Error deleting file:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    logger.error("Error deleting file:", error);
    throw new Error(`Failed to delete file: ${error}`);
  }
};

// Export the service
export const supabaseStorageService = {
  getSignedUploadUrl,
  getPublicUrl,
  deleteFile
}; 