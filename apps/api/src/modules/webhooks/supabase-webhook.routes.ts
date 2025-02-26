/**
 * Supabase Webhook Routes
 * 
 * Handles webhooks from Supabase, particularly for auth events
 */

import { Hono } from "hono";
import { syncSupabaseUser } from "@repo/db/src/supabase-sync";
import { logger } from "@repo/logs";

// Create a Hono router for Supabase webhooks
export const supabaseWebhookRoutes = new Hono()
  // Auth webhook - handles user creation, updates, and deletions
  .post("/auth", async (c) => {
    try {
      const payload = await c.req.json();
      
      // Log webhook event
      logger.info(`Received Supabase webhook: ${payload.type || 'unknown'}`);
      
      // Check if this is a supported event type
      const eventType = payload.type as string;
      const record = payload.record;
      
      // Handle user-related events
      if ((eventType === "INSERT" || eventType === "UPDATE") && record) {
        // Sync user with our database
        await syncSupabaseUser({
          id: record.id,
          email: record.email,
        });
        
        logger.info(`User synced: ${record.id}`);
      }
      
      return c.json({ success: true });
    } catch (error) {
      logger.error("Error processing Supabase webhook:", error);
      return c.json({ error: "Failed to process webhook" }, 500);
    }
  }); 