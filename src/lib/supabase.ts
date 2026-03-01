import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr';
import { createBrowserClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export const cookieOptions: CookieOptionsWithName = {
  path: '/',
  httpOnly: true,
  secure: import.meta.env.PROD,
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 30,
};

export function createSupabaseServer(cookies: AstroCookies) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) { return cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptionsWithName) {
          cookies.set(name, value, { ...cookieOptions, ...options });
        },
        remove(name: string, options: CookieOptionsWithName) {
          cookies.delete(name, { ...cookieOptions, ...options });
        },
      },
    }
  );
}

export function createSupabaseBrowser() {
  return createBrowserClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getSession(cookies: AstroCookies) {
  const supabase = createSupabaseServer(cookies);
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUserProfile(cookies: AstroCookies) {
  const supabase = createSupabaseServer(cookies);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
  return data;
}

export function formatMWK(amount: number): string {
  return new Intl.NumberFormat('en-MW', { style: 'currency', currency: 'MWK', minimumFractionDigits: 2 }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}