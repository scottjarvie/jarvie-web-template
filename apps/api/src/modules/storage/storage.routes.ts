/**
 * Storage Routes
 * 
 * API routes for storage operations using multiple storage providers
 */

import { Hono } from "hono";
import { zValidator } from "@/pkg/util/validator-wrapper";
import { z } from "zod";
import { auth, getUserId, requireAuth } from "@/pkg/middleware/supabase-auth";
import { supabaseStorageService } from "@/pkg/services/supabase-storage";
import { logger } from "@repo/logs";
import { backblazeRoutes } from "./backblaze.routes";

// Validation schema for upload request
const uploadRequestSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
});

// Create a new Hono router for Supabase storage routes
const supabaseRoutes = new Hono()
  .use(auth())
  
  // Get a signed URL for direct upload to Supabase Storage
  .post("/signed-upload", requireAuth, zValidator("json", uploadRequestSchema), async (c) => {
    try {
      const userId = getUserId(c);
      const { fileName, contentType } = c.req.valid("json");
      
      const { signedUrl, key } = await supabaseStorageService.getSignedUploadUrl(
        fileName,
        contentType,
        userId || undefined
      );
      
      return c.json({ signedUrl, key });
    } catch (error) {
      logger.error("Error generating signed upload URL:", error);
      return c.json({ error: "Failed to generate signed upload URL" }, 500);
    }
  })
  
  // Get public URL for a file
  .get("/public-url", requireAuth, async (c) => {
    try {
      const fileKey = c.req.query("key");
      
      if (!fileKey) {
        return c.json({ error: "File key is required" }, 400);
      }
      
      const publicUrl = supabaseStorageService.getPublicUrl(fileKey);
      return c.json({ publicUrl });
    } catch (error) {
      logger.error("Error getting public URL:", error);
      return c.json({ error: "Failed to get public URL" }, 500);
    }
  })
  
  // Delete a file
  .delete("/:fileKey", requireAuth, async (c) => {
    try {
      const fileKey = c.req.param("fileKey");
      
      if (!fileKey) {
        return c.json({ error: "File key is required" }, 400);
      }
      
      await supabaseStorageService.deleteFile(fileKey);
      return c.json({ success: true });
    } catch (error) {
      logger.error("Error deleting file:", error);
      return c.json({ error: "Failed to delete file" }, 500);
    }
  }); 

// Create a combined router for storage operations
const storageRoutes = new Hono()
  // Supabase storage routes (legacy)
  .route("/supabase", supabaseRoutes)
  // Backblaze B2 storage routes
  .route("/backblaze", backblazeRoutes);

export { storageRoutes }; 