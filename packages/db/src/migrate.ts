/**
 * Database Migration Manager
 * 
 * This script executes database migrations using Drizzle ORM.
 * It can be called directly or imported into other scripts.
 */

import { migrate } from "drizzle-orm/postgres-js/migrator";
import { config } from "dotenv";
import { createDrizzleClient } from "./client";

// Load environment variables
config({ path: ".env" });

// Create database client for migrations
const migrationClient = createDrizzleClient(process.env.DATABASE_URL!);

/**
 * Run all pending migrations
 */
export async function runMigrations() {
  try {
    console.log("Starting database migration...");
    
    // Run Drizzle migrations
    await migrate(migrationClient, { migrationsFolder: "./drizzle" });
    
    console.log("Migration completed successfully ✅");
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migrations when script is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} 