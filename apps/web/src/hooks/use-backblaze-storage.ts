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
      const client = await getApiClient();
      const presignedResponse = await client.storage.backblaze["presigned-upload"].$post({
        json: {
          fileName: file.name,
          contentType: file.type,
        },
      });

      const { presignedUrl, key } = await presignedResponse.json();

      // Step 2: Upload the file through our proxy to avoid CORS issues
      const uploadResponse = await client.storage.backblaze["proxy-upload"].$post({
        json: {
          presignedUrl,
          key,
          contentType: file.type,
          // Convert file to base64 for transmission
          fileData: await fileToBase64(file)
        },
      });

      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Upload failed");
      }

      // Step 3: Get the public URL
      const urlResponse = await client.storage.backblaze["public-url"][key].$get();
      const { publicUrl } = await urlResponse.json();

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
      const client = await getApiClient();
      const response = await client.storage.backblaze[key].$delete();
      const { success } = await response.json();
      return success;
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
      const client = await getApiClient();
      const response = await client.storage.backblaze.exists[key].$get();
      const { exists } = await response.json();
      return exists;
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
      const client = await getApiClient();
      let response;
      
      if (prefix) {
        response = await client.storage.backblaze.list[prefix].$get();
      } else {
        response = await client.storage.backblaze.list.$get();
      }
      
      const { files } = await response.json();
      return files;
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