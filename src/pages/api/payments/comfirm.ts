// src/pages/api/payments/confirm.ts
import type { APIRoute } from 'astro';
import { createSupabaseServer } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createSupabaseServer(cookies);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return redirect('/login');

  // Only officers/admins can confirm
  const { data: userProfile } = await supabase
    .from('users').select('role').eq('id', session.user.id).single();

  if (!userProfile || !['officer', 'admin'].includes(userProfile.role)) {
    return new Response('Unauthorized', { status: 403 });
  }

  const form      = await request.formData();
  const paymentId = form.get('payment_id')?.toString();

  if (!paymentId) return new Response('Missing payment_id', { status: 400 });

  const { error } = await supabase
    .from('payments')
    .update({
      status:       'confirmed',
      confirmed_by: session.user.id,
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', paymentId);

  if (error) return new Response(error.message, { status: 500 });

  // Log it
  await supabase.from('audit_logs').insert({
    user_id:    session.user.id,
    action:     'CONFIRM',
    table_name: 'payments',
    record_id:  paymentId,
    new_values: { status: 'confirmed' },
  });

  return redirect('/payments');
};