import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { createClient } from "@supabase/supabase-js";
import * as schema from "./schema";

/**
 * Creates a configured Drizzle ORM client
 * 
 * @param connectionString PostgreSQL connection string
 * @returns Drizzle ORM client instance
 */
export function createDrizzleClient(connectionString: string) {
  if (!connectionString) {
    throw new Error("Database connection string is required");
  }

  // Configure Postgres client options
  const clientOptions = {
    max: 10, // Maximum number of connections
    prepare: false, // Allows for faster queries in some cases
    types: {
      // Add custom type parsers if needed
    },
  };

  const client = postgres(connectionString, clientOptions);
  return drizzle(client, { schema });
}

/**
 * Creates a Supabase client for auth and storage
 * 
 * @returns Supabase client instance
 */
export function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_ANON_KEY!;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Missing Supabase environment variables. Supabase client will not be properly initialized.");
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Export instances for use throughout the application
export const db = createDrizzleClient(process.env.DATABASE_URL!);
export const supabase = createSupabaseClient();

// Re-export for convenience
export * from "./schema";
export * from "drizzle-orm";
