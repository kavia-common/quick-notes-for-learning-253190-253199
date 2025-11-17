import { createClient } from '@supabase/supabase-js';
import { getEnvConfig } from '../config';

/**
 * Supabase client factory and accessor.
 * Reads REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY from env.
 * Returns a configured client or null when not configured.
 * No secrets are logged.
 */

// Singleton cache to avoid multiple connections
let _client = undefined;

// PUBLIC_INTERFACE
export function getSupabaseClient() {
  /** Returns a singleton Supabase client instance or null if not configured. */
  if (typeof window === 'undefined') return null;
  if (_client !== undefined) return _client;

  const url = process.env.REACT_APP_SUPABASE_URL || '';
  const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

  // Feature flag guard: only construct when direct mode is enabled
  const { featureFlags } = getEnvConfig();
  const useSupabaseDirect = !!(featureFlags && featureFlags.useSupabaseDirect === true);

  if (!useSupabaseDirect || !url || !anonKey) {
    _client = null;
    return _client;
  }

  try {
    _client = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'x-frontend-app': 'quick-notes',
        },
      },
    });
  } catch {
    _client = null;
  }
  return _client;
}
