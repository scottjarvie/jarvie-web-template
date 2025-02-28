/**
 * Backblaze B2 Storage Hook
 * 
 * A React hook for interacting with Backblaze B2 storage through the API.
 * This hook provides functions for uploading, deleting, and listing files.
 */

import { useState } from "react";
import { getApiClient } from "@/api/client";

interface UploadOptions {
  onProgress?: (progress: number) => void;
  onSuccess?: (url: string, key: string) => void;
  onError?: (error: Error) => void;
}

interface UseBackblazeStorageReturn {
  uploading: boolean;
  uploadFile: (file: File, options?: UploadOptions) => Promise<{ url: string; key: string } | null>;
  deleteFile: (key: string) => Promise<boolean>;
  fileExists: (key: string) => Promise<boolean>;
  listFiles: (prefix?: string) => Promise<any[]>;
}

// API helper functions
async function getPresignedUrl(fileName: string, contentType: string) {
  const client = await getApiClient();
  const response = await client.storage.backblaze["presigned-upload"].$post({
    json: {
      fileName,
      contentType,
    },
  });
  return response.json();
}

async function proxyUpload(presignedUrl: string, key: string, contentType: string, fileData: string) {
  const client = await getApiClient();
  // Use fetch directly instead of the client since proxy-upload may not be typed correctly
  const response = await fetch(`/api/storage/backblaze/proxy-upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      presignedUrl,
      key,
      contentType,
      fileData,
    }),
  });
  return response.json();
}

async function getPublicUrl(key: string) {
  const client = await getApiClient();
  // Use fetch directly instead of the client
  const response = await fetch(`/api/storage/backblaze/public-url/${key}`);
  return response.json();
}

async function deleteBackblazeFile(key: string) {
  const client = await getApiClient();
  const response = await client.storage.backblaze[':key'].$delete({
    param: { key }
  });
  return response.json();
}

async function checkFileExists(key: string) {
  const client = await getApiClient();
  const response = await client.storage.backblaze.exists[':key'].$get({
    param: { key }
  });
  return response.json();
}

async function listBackblazeFiles(prefix?: string) {
  const client = await getApiClient();
  const response = await client.storage.backblaze.list[':prefix?'].$get({
    param: { prefix }
  });
  return response.json();
}

/**
 * Hook for interacting with Backblaze B2 storage
 */
export function useBackblazeStorage(): UseBackblazeStorageReturn {
  const [uploading, setUploading] = useState(false);

  /**
   * Convert a File to base64 string
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64String = reader.result.split(',')[1];
          if (base64String) {
            resolve(base64String);
          } else {
            reject(new Error('Failed to extract base64 data from file'));
          }
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  /**
   * Upload a file to Backblaze B2
   */
  const uploadFile = async (
    file: File,
    options?: UploadOptions
  ): Promise<{ url: string; key: string } | null> => {
    try {
      setUploading(true);
      
      // Step 1: Get a presigned URL from our API
      const presignedData = await getPresignedUrl(file.name, file.type);
      
      // Check if there's an error in the response
      if ('error' in presignedData) {
        throw new Error(presignedData.error);
      }
      
      const { presignedUrl, key } = presignedData;

      // Step 2: Upload the file through our proxy to avoid CORS issues
      const fileData = await fileToBase64(file);
      const uploadResult = await proxyUpload(presignedUrl, key, file.type, fileData);
      
      if ('error' in uploadResult || !uploadResult.success) {
        throw new Error('error' in uploadResult ? uploadResult.error : "Upload failed");
      }

      // Step 3: Get the public URL
      const urlData = await getPublicUrl(key);
      
      if ('error' in urlData) {
        throw new Error(urlData.error);
      }
      
      const { publicUrl } = urlData;

      options?.onSuccess?.(publicUrl, key);
      return { url: publicUrl, key };
    } catch (error) {
      console.error("Error uploading file:", error);
      options?.onError?.(error instanceof Error ? error : new Error('Unknown error'));
      return null;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Delete a file from Backblaze B2
   */
  const deleteFile = async (key: string): Promise<boolean> => {
    try {
      const result = await deleteBackblazeFile(key);
      
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      return result.success;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  };

  /**
   * Check if a file exists
   */
  const fileExists = async (key: string): Promise<boolean> => {
    try {
      const result = await checkFileExists(key);
      
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      return result.exists;
    } catch (error) {
      console.error("Error checking if file exists:", error);
      return false;
    }
  };

  /**
   * List files with a prefix
   */
  const listFiles = async (prefix?: string): Promise<any[]> => {
    try {
      const result = await listBackblazeFiles(prefix);
      
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      return result.files;
    } catch (error) {
      console.error("Error listing files:", error);
      return [];
    }
  };

  return {
    uploading,
    uploadFile,
    deleteFile,
    fileExists,
    listFiles,
  };
} 