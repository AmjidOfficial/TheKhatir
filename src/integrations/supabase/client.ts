import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

let client: SupabaseClient<Database> | null = null;

/**
 * Get the browser client only after deployment configuration is present.
 * This prevents a missing environment variable from crashing the public website.
 * Never place a service-role or secret key in a VITE_* variable.
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Khatir workspace is not connected yet. Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY for the approved Khatir project."
    );
  }

  if (!client) {
    client = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return client;
}
