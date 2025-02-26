/**
 * Backblaze B2 Storage Routes
 * 
 * API routes for storage operations using Backblaze B2
 */

import { Hono } from "hono";
import { zValidator } from "@/pkg/util/validator-wrapper";
import { z } from "zod";
import { auth, getUserId, requireAuth } from "@/pkg/middleware/clerk-auth";
import { backblazeStorageService } from "@/pkg/services/backblaze-storage";
import { logger } from "@repo/logs";
import fetch from "node-fetch";

// Create a new Hono router for Backblaze B2 storage routes
const backblazeRoutes = new Hono()
  .use(auth())
  
  // Get a presigned URL for direct upload to Backblaze B2
  .post("/presigned-upload", requireAuth, async (c) => {
    try {
      const userId = getUserId(c);
      const { fileName, contentType } = await c.req.json();
      
      if (!fileName || !contentType) {
        return c.json({ error: "fileName and contentType are required" }, 400);
      }
      
      const { presignedUrl, key } = await backblazeStorageService.getPresignedUploadUrl(
        fileName,
        contentType,
        userId
      );
      
      return c.json({ presignedUrl, key });
    } catch (error) {
      logger.error("Error generating presigned upload URL:", error);
      return c.json({ error: "Failed to generate presigned upload URL" }, 500);
    }
  })
  
  // Delete a file
  .delete("/:key", requireAuth, async (c) => {
    try {
      const key = c.req.param("key");
      
      if (!key) {
        return c.json({ error: "File key is required" }, 400);
      }
      
      const success = await backblazeStorageService.deleteFile(key);
      
      return c.json({ success });
    } catch (error) {
      logger.error("Error deleting file:", error);
      return c.json({ error: "Failed to delete file" }, 500);
    }
  })
  
  // Check if a file exists
  .get("/exists/:key", async (c) => {
    try {
      const key = c.req.param("key");
      
      if (!key) {
        return c.json({ error: "File key is required" }, 400);
      }
      
      const exists = await backblazeStorageService.fileExists(key);
      
      return c.json({ exists });
    } catch (error) {
      logger.error("Error checking if file exists:", error);
      return c.json({ error: "Failed to check if file exists" }, 500);
    }
  })
  
  // List files with a prefix
  .get("/list/:prefix?", requireAuth, async (c) => {
    try {
      const prefix = c.req.param("prefix") || "";
      const userId = getUserId(c);
      
      // If user is authenticated, scope the listing to their files
      const userPrefix = userId ? `${userId}/` : "";
      const fullPrefix = prefix ? `${userPrefix}${prefix}` : userPrefix;
      
      const files = await backblazeStorageService.listFiles(fullPrefix);
      
      return c.json({ files });
    } catch (error) {
      logger.error("Error listing files:", error);
      return c.json({ error: "Failed to list files" }, 500);
    }
  })
  
  // Get public URL for a file
  .get("/public-url/:key", async (c) => {
    try {
      const key = c.req.param("key");
      
      if (!key) {
        return c.json({ error: "File key is required" }, 400);
      }
      
      const publicUrl = backblazeStorageService.getPublicUrl(key);
      
      return c.json({ publicUrl });
    } catch (error) {
      logger.error("Error getting public URL:", error);
      return c.json({ error: "Failed to get public URL" }, 500);
    }
  });

// Schema for proxy upload request
const proxyUploadSchema = z.object({
  presignedUrl: z.string().min(1),
  key: z.string().min(1),
  contentType: z.string().min(1),
  fileData: z.string().min(1), // Base64 encoded file data
});

/**
 * Proxy upload to Backblaze B2 to avoid CORS issues
 * POST /api/backblaze/proxy-upload
 */
backblazeRoutes.post(
  "/proxy-upload",
  requireAuth,
  zValidator("json", proxyUploadSchema),
  async (c) => {
    try {
      const { presignedUrl, key, contentType, fileData } = c.req.valid("json");
      const userId = getUserId(c);

      // Convert base64 to buffer
      const buffer = Buffer.from(fileData, 'base64');

      // Upload to Backblaze B2 using the presigned URL
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: buffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Error uploading file to Backblaze B2: ${response.status} ${errorText}`);
        throw new Error(`Upload failed: ${response.status}`);
      }

      logger.info(`Successfully uploaded file ${userId}/${key} via proxy`);

      return c.json({ 
        success: true, 
        key,
        message: "File uploaded successfully" 
      });
    } catch (error) {
      logger.error("Error in proxy upload:", error);
      return c.json(
        { 
          error: error instanceof Error ? error.message : "Failed to upload file",
          success: false
        },
        { status: 500 }
      );
    }
  }
);

export { backblazeRoutes }; 