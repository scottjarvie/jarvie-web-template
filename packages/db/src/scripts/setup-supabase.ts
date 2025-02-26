/**
 * Supabase Setup Script
 * 
 * This script helps set up the initial Supabase configuration for a project,
 * including storage buckets and other resources.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env" });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Check if required environment variables are set
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

async function main() {
  try {
    console.log("Setting up Supabase...");
    
    // Create admin client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // 1. Create storage bucket if it doesn't exist
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';
    
    console.log(`Checking for storage bucket: ${bucketName}`);
    
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      throw bucketsError;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Creating storage bucket: ${bucketName}`);
      
      const { error } = await supabase
        .storage
        .createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
      
      if (error) {
        throw error;
      }
      
      console.log(`Storage bucket created: ${bucketName}`);
    } else {
      console.log(`Storage bucket already exists: ${bucketName}`);
    }
    
    // 2. Setup Webhook if needed
    // Note: This part can be expanded to create webhooks programmatically
    console.log("\nTo set up auth webhooks manually:");
    console.log(`1. Go to your Supabase dashboard: ${SUPABASE_URL}`);
    console.log("2. Navigate to Authentication > Webhooks");
    console.log("3. Create a new webhook with the following details:");
    console.log("   - Event Type: auth events (user.created, user.updated)");
    console.log("   - URL: https://your-api-url.com/api/webhooks/supabase/auth");
    
    console.log("\nSupabase setup completed successfully");
    
  } catch (error) {
    console.error("Supabase setup failed:", error);
    process.exit(1);
  }
}

// Run the main function
main(); 