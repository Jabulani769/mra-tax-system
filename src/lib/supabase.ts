// src/lib/supabase.ts
import {
  createServerClient,
  type CookieOptionsWithName,
  parse,
  serialize,
} from '@supabase/ssr';
import { createBrowserClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

// Recommended cookie settings
export const cookieOptions: CookieOptionsWithName = {
  path: '/',
  httpOnly: true,
  secure: import.meta.env.PROD,
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 30, // 30 days (adjust as needed)
};

export function createSupabaseServer(cookies: AstroCookies) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          const cookie = cookies.get(name);
          return cookie?.value;
        },
        set(name: string, value: string, options: CookieOptionsWithName) {
          cookies.set(name, value, {
            ...cookieOptions,
            ...options,
            // Astro uses its own options shape, but this merges safely
          });
        },
        remove(name: string, options: CookieOptionsWithName) {
          cookies.delete(name, {
            ...cookieOptions,
            ...options,
          });
        },
      },
    }
  );
}

// Optional: browser client (for <script> islands later)
export function createSupabaseBrowser() {
  return createBrowserClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  );
}

// Helper to get session safely
export async function getSession(cookies: AstroCookies) {
  const supabase = createSupabaseServer(cookies);
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}