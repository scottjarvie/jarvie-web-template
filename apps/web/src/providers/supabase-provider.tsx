"use client";

/**
 * Supabase Provider
 * 
 * This component provides Supabase authentication context to the application.
 * It manages user sessions and exposes the Supabase client to child components.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { createClient, type User, type SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Define context type
type SupabaseContextType = {
  supabase: SupabaseClient;
  user: User | null;
  loading: boolean;
};

// Create the context
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

/**
 * Supabase Provider Component
 */
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  // Create Supabase client once
  const [supabase] = useState(() => createClient(supabaseUrl, supabaseAnonKey));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Refresh router to update client components
        router.refresh();
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <SupabaseContext.Provider value={{ supabase, user, loading }}>
      {children}
    </SupabaseContext.Provider>
  );
}

/**
 * Hook to use Supabase context
 */
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
}; 