import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';
import type { Database } from './database.types';

let browserClient: SupabaseClient<Database> | null = null;

export function createClient(): SupabaseClient<Database> | null {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  browserClient ??= createBrowserClient<Database>(config.url, config.anonKey);
  return browserClient;
}
