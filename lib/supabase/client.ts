import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return dummy client fallback when env vars are omitted for zero-cost local demo
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
