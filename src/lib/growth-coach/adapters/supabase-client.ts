import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Single shared service-role Supabase client for every adapter in this
 * folder (leads, AI usage tracking) — extracted so a second adapter never
 * needs to duplicate the "is it configured / lazily construct the client"
 * logic that used to live only in supabase.ts. Server-only; bypasses RLS by
 * design, so this must never be imported into client-side code.
 */

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getServiceRoleClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set. See .env.example.");
  }
  if (!client) client = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  return client;
}
