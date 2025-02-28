/**
 * API Server Entry Point
 * 
 * This file serves as the main entry point for the Hono API server.
 * It configures middleware, routes, and server settings for the application.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

// Import route modules
import { postRoutes } from "@/modules/posts";
import { errorHandler } from "@/pkg/middleware/error";
import { webhookRoutes } from "@/modules/webhooks/webhook.routes";
import { storageRoutes } from "@/modules/storage/storage.routes";
import { supabaseWebhookRoutes } from "@/modules/webhooks/supabase-webhook.routes";
import { openaiRoutes } from "@/modules/openai/openai.routes";

// Get environment variables with defaults
const PORT = Number(process.env.PORT || 3004);
const NODE_ENV = process.env.NODE_ENV || "development";
const isDev = NODE_ENV === "development";

// Create Hono app
const app = new Hono();

// Global middleware
app.use("*", logger());
if (isDev) {
  app.use("*", prettyJSON());
}

// CORS configuration
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://*.onrender.com"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// API routes
const routes = app
  .basePath("/api")
  .use("*", errorHandler())
  .route("/storage", storageRoutes)
  .route("/webhooks", webhookRoutes)
  .route("/webhooks/supabase", supabaseWebhookRoutes)
  .route("/openai", openaiRoutes)
  .route("/posts", postRoutes);

// Not found handler
app.notFound((c) => {
  return c.json({ error: "Not Found", status: 404 }, 404);
});

// Global error handler
app.onError((err, c) => {
  console.error(`${c.req.method} ${c.req.url}`, err);
  return c.json({ error: err.message, status: 500 }, 500);
});

// Export type for client
export type AppType = typeof routes;

/**
 * Configure Bun server with optimized settings
 * 
 * These settings are tuned for production performance:
 * - Increased request body size limit for file uploads
 * - Optimized idle timeout for connection management
 * - Development mode detection for debugging
 */
export default {
  port: PORT,
  fetch: app.fetch,
  development: isDev,
  // Performance tuning for Bun
  maxRequestBodySize: 10 * 1024 * 1024, // 10MB
  idleTimeout: 30,
  // Enable TLS in production if certificates are available
  tls: process.env.API_PRODUCTION === "true" ? {
    key: Bun.file("./certs/key.pem"),
    cert: Bun.file("./certs/cert.pem"),
  } : undefined,
};
