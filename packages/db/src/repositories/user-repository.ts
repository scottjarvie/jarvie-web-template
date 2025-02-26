/**
 * User Repository
 * 
 * This repository handles all database operations related to users.
 */

import { eq, sql } from "drizzle-orm";
import { db } from "../client";
import { users } from "../schema";

/**
 * Repository for user-related database operations
 */
export class UserRepository {
  /**
   * Find a user by ID
   */
  async findById(userId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);
    
    return user;
  }
  
  /**
   * Find a user by Supabase ID
   */
  async findBySupabaseId(supabaseId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.supabaseId, supabaseId))
      .limit(1);
    
    return user;
  }
  
  /**
   * Find a user by email
   */
  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    return user;
  }
  
  /**
   * Create a new user
   */
  async create(data: { 
    userId: string; 
    supabaseId?: string; 
    email: string;
    enableRls?: boolean;
  }) {
    const [user] = await db
      .insert(users)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    return user;
  }
  
  /**
   * Update an existing user
   */
  async update(userId: string, data: Partial<{ 
    supabaseId?: string; 
    email?: string;
    enableRls?: boolean;
  }>) {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.userId, userId))
      .returning();
    
    return user;
  }
  
  /**
   * Delete a user
   */
  async delete(userId: string) {
    const [user] = await db
      .delete(users)
      .where(eq(users.userId, userId))
      .returning();
    
    return user;
  }
}

// Export singleton instance for use throughout the application
export const userRepository = new UserRepository(); 