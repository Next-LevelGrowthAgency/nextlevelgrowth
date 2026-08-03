"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseAuthConfigured } from "./config";

/**
 * Browser-side Supabase client — uses the ANON key (safe to expose; every
 * table it can touch is protected by RLS). Only ever call this from client
 * components, and only after checking isSupabaseAuthConfigured() (auth UI
 * should already be hidden/disabled otherwise — see /login, /signup).
 */
export function createSupabaseBrowserClient() {
  if (!isSupabaseAuthConfigured()) {
    throw new Error("Supabase Auth is not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). See .env.example.");
  }
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);
}
