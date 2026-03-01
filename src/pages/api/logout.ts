// src/pages/api/logout.ts
import type { APIRoute } from 'astro';
import { createSupabaseServer } from '../../lib/supabase';

export const POST: APIRoute = async ({ cookies, request, redirect }) => {
  const supabase = createSupabaseServer(cookies, request);
  await supabase.auth.signOut();

  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });

  return redirect('/login');
};