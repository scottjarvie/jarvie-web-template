/**
 * Supabase User Sync Utility
 * 
 * This utility helps synchronize Supabase auth users with our application database.
 * It's used primarily by webhooks to keep user data in sync when auth events occur.
 */

import { db } from "./client";
import { users } from "./schema";
import { eq } from "drizzle-orm";

export interface SupabaseUser {
  id: string;
  email: string;
  // Add other fields you want to sync from Supabase auth
}

/**
 * Creates or updates a user in our database based on Supabase auth data
 */
export async function syncSupabaseUser(supabaseUser: SupabaseUser) {
  try {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.supabaseId, supabaseUser.id))
      .limit(1);
    
    const userData = {
      supabaseId: supabaseUser.id,
      email: supabaseUser.email,
    };
    
    if (existingUser.length === 0) {
      // Create new user with a generated userId
      await db.insert(users).values({
        ...userData,
        userId: supabaseUser.id, // Using Supabase id as userId for simplicity
      });
      
      console.log(`Created new user: ${supabaseUser.id}`);
      return true;
    } else {
      // Update existing user
      await db
        .update(users)
        .set({
          ...userData,
        })
        .where(eq(users.supabaseId, supabaseUser.id));
      
      console.log(`Updated existing user: ${supabaseUser.id}`);
      return true;
    }
  } catch (error) {
    console.error("Error syncing Supabase user:", error);
    throw error;
  }
} 