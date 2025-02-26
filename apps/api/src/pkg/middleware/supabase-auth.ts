/**
 * Supabase Authentication Middleware
 * 
 * This middleware verifies the JWT from Supabase Auth and adds the user to the context.
 */

import { Context, Next } from "hono";
import { createClient } from "@supabase/supabase-js";
import { User } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

declare module "hono" {
  interface ContextVariableMap {
    user: User | null;
  }
}

/**
 * Middleware to parse and verify Supabase Auth token
 * If valid, adds the user to the context
 */
export const auth = () => {
  return async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header("Authorization");
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        c.set("user", null);
        return next();
      }
      
      const token = authHeader.split(" ")[1];
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data.user) {
        c.set("user", null);
        return next();
      }
      
      c.set("user", data.user);
      return next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      c.set("user", null);
      return next();
    }
  };
};

/**
 * Middleware to require authentication
 * Returns 401 if no user is found in context
 */
export const requireAuth = async (c: Context, next: Next) => {
  const user = c.get("user");
  
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  return next();
};

/**
 * Helper to get the user ID from context
 */
export const getUserId = (c: Context): string | null => {
  const user = c.get("user");
  return user?.id || null;
}; 