// src/pages/api/logout.ts
import type { APIRoute } from 'astro';
import { createSupabaseServer } from '../../lib/supabase';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const supabase = createSupabaseServer(cookies);
  await supabase.auth.signOut();

  // Clear cookies if needed (supabase handles most of it)
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });

  return redirect('/login');
};