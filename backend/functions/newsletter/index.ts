// ===================================================
// Tech-geo — Newsletter Edge Function
// ===================================================
// Subscribe, unsubscribe, send newsletter blast
//
// Deploy: supabase functions deploy newsletter
// ===================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendKey = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const body = await req.json();
  const { action } = body;

  switch (action) {
    case 'subscribe':
      return await handleSubscribe(supabase, body);
    case 'unsubscribe':
      return await handleUnsubscribe(supabase, body);
    case 'send':
      return await handleSend(supabase, body, req);
    case 'list':
      return await handleList(supabase, body, req);
    default:
      return jsonResponse({ error: 'Action invalide : subscribe, unsubscribe, send, list' }, 400);
  }
});

async function handleSubscribe(supabase, body) {
  const { email, name } = body;
  if (!email) return jsonResponse({ error: 'email est requis' }, 400);

  // Check if already subscribed
  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('id, active')
    .eq('email', email)
    .single();

  if (existing) {
    if (existing.active) {
      return jsonResponse({ success: true, alreadySubscribed: true });
    }
    // Re-activate
    await supabase.from('newsletter_subscribers')
      .update({ active: true, subscribed_at: new Date().toISOString() })
      .eq('id', existing.id);
    return jsonResponse({ success: true, reactivated: true });
  }

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email, name: name || '', active: true, subscribed_at: new Date().toISOString() })
    .select().single();

  if (error) return jsonResponse({ error: error.message }, 400);
  return jsonResponse({ success: true, subscriber: data }, 201);
}

async function handleUnsubscribe(supabase, body) {
  const { email, token } = body;
  if (!email && !token) return jsonResponse({ error: 'email ou token requis' }, 400);

  let query = supabase.from('newsletter_subscribers')
    .update({ active: false, unsubscribed_at: new Date().toISOString() });

  if (token) {
    query = query.eq('unsubscribe_token', token);
  } else {
    query = query.eq('email', email);
  }

  const { error } = await query;
  if (error) return jsonResponse({ error: error.message }, 400);

  return jsonResponse({ success: true });
}

async function handleSend(supabase, body, req) {
  // Admin only
  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!authHeader) return jsonResponse({ error: 'Unauthorized' }, 401);

  const userSupabase = createClient(supabaseUrl, authHeader);
  const { data: { user } } = await userSupabase.auth.getUser(authHeader);
  if (!user) return jsonResponse({ error: 'Invalid token' }, 401);

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return jsonResponse({ error: 'Admin only' }, 403);

  const { subject, html, segment } = body;
  if (!subject || !html) return jsonResponse({ error: 'subject et html sont requis' }, 400);

  // Get subscribers
  let query = supabase.from('newsletter_subscribers')
    .select('email, name')
    .eq('active', true);

  if (segment === 'customers') {
    // Only customers who have ordered
    const { data: orders } = await supabase
      .from('orders').select('customer->>email').not('customer', 'is', null);
    const customerEmails = [...new Set(orders?.map(o => o.customer?.email).filter(Boolean))];
    query = query.in('email', customerEmails);
  }

  const { data: subscribers, error } = await query;
  if (error) return jsonResponse({ error: error.message }, 400);

  if (!subscribers || subscribers.length === 0) {
    return jsonResponse({ error: 'Aucun abonné trouvé' }, 404);
  }

  // Send emails in batches (Resend limit: 100 per call)
  let sent = 0;
  let failed = 0;
  const batches = [];

  for (let i = 0; i < subscribers.length; i += 50) {
    const batch = subscribers.slice(i, i + 50);
    batches.push(sendBatch(batch, subject, html));
  }

  const results = await Promise.allSettled(batches);
  for (const result of results) {
    if (result.status === 'fulfilled') {
      sent += result.value.sent;
      failed += result.value.failed;
    } else {
      failed += 50;
    }
  }

  return jsonResponse({ success: true, sent, failed, total: subscribers.length });
}

async function sendBatch(subscribers, subject, html) {
  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    if (!resendKey) { failed++; continue; }

    try {
      const personalizedHtml = html
        .replace(/\{\{name\}\}/g, sub.name || 'Client')
        .replace(/\{\{email\}\}/g, sub.email);

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: 'Tech-geo <newsletter@tech-geo.com>',
          to: [sub.email],
          subject,
          html: personalizedHtml,
        }),
      });

      if (res.ok) sent++; else failed++;
    } catch {
      failed++;
    }
  }

  return { sent, failed };
}

async function handleList(supabase, body, req) {
  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!authHeader) return jsonResponse({ error: 'Unauthorized' }, 401);

  const { data: subscribers, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, name, active, subscribed_at, unsubscribed_at')
    .order('subscribed_at', { ascending: false })
    .limit(body.limit || 100);

  if (error) return jsonResponse({ error: error.message }, 400);

  return jsonResponse({ subscribers: subscribers || [] });
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
