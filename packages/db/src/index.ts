/**
 * Database Package Entry Point
 * 
 * This package provides a consistent interface to the database using Drizzle ORM.
 * It exports schema definitions, types, and a configured database client.
 * 
 * Usage:
 * ```
 * import { db, users, posts } from "@repo/db";
 * 
 * // Query users
 * const allUsers = await db.select().from(users);
 * ```
 */

// Export schema and type definitions
export * from "./schema";
export * from "./types";

// Export necessary Drizzle ORM functions
export * from "drizzle-orm";
export { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";

// Export configured database client
export { db } from "./client";

// Export repositories for easier data access
export * from "./repositories/user-repository";
// Add other repository exports here as they are created
