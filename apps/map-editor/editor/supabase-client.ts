import { createBrowserClient } from '@supabase/ssr';

// Public browser configuration for the canonical Vendrith Supabase project.
// Environment variables still take precedence so Vercel can override them later.
const DEFAULT_SUPABASE_URL = 'https://ojtmfokjcirvjvhnbnos.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_DIe0amy6Q4qVXV6srZTCRQ_DHe6NANN';

export function createMapEditorSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) return null;
  return createBrowserClient(url, publishableKey);
}
