/**
 * Schema Validation Utility
 * 
 * This script validates that the database schema matches what's defined in code.
 * It's useful for detecting drift between migrations and code.
 */

import { db } from "./client";
import * as schema from "./schema";
import { sql } from "drizzle-orm";

async function validateSchema() {
  console.log("Validating database schema...");
  
  try {
    // Get all tables defined in our schema
    const schemaTables = Object.entries(schema)
      .filter(([_, value]) => typeof value === 'object' && value !== null && 'name' in value)
      .map(([_, value]) => (value as any).name);
    
    console.log("Schema tables:", schemaTables);
    
    // Get all existing tables in the database
    const { rows: existingTables } = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    const existingTableNames = existingTables.map((t: any) => t.table_name);
    console.log("Existing tables:", existingTableNames.join(", "));
    
    // Check for missing tables
    const missingTables = schemaTables.filter(
      table => !existingTableNames.includes(table)
    );
    
    if (missingTables.length > 0) {
      console.log("Missing tables:", missingTables.join(", "));
      console.log("Run migrations to create missing tables");
      process.exit(1);
    }
    
    // Check for columns in each table
    for (const tableName of schemaTables) {
      const tableObject = Object.values(schema).find((t: any) => 
        typeof t === 'object' && t !== null && 'name' in t && t.name === tableName
      ) as any;
      
      if (!tableObject) continue;
      
      // Get column names from schema
      const schemaColumns = Object.keys(tableObject.columns || {});
      
      // Get column names from database
      const { rows: existingColumns } = await db.execute(sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${tableName}
        ORDER BY column_name;
      `);
      
      const existingColumnNames = existingColumns.map((c: any) => c.column_name);
      
      // Check for missing columns
      const missingColumns = schemaColumns.filter(
        column => !existingColumnNames.includes(column)
      );
      
      if (missingColumns.length > 0) {
        console.log(`Table '${tableName}' is missing columns:`, missingColumns.join(", "));
        console.log("Run migrations to update table structure");
        process.exit(1);
      }
    }
    
    console.log("Schema validation successful ✅");
    process.exit(0);
  } catch (error) {
    console.error("Schema validation failed:", error);
    process.exit(1);
  }
}

// Run validation when script is executed directly
if (require.main === module) {
  validateSchema();
} 