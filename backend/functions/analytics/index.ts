// ===================================================
// Tech-geo — Analytics Edge Function
// ===================================================
// Track page views, conversions, product views
//
// Deploy: supabase functions deploy analytics
// ===================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const url = new URL(req.url);

  // Track event (public — no auth required)
  if (req.method === 'POST' && url.pathname.includes('track')) {
    return await trackEvent(supabase, req);
  }

  // Get stats (admin only)
  if (req.method === 'GET') {
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) return jsonResponse({ error: 'Unauthorized' }, 401);

    const userSupabase = createClient(supabaseUrl, authHeader);
    const { data: { user } } = await userSupabase.auth.getUser(authHeader);
    if (!user) return jsonResponse({ error: 'Invalid token' }, 401);

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return jsonResponse({ error: 'Admin only' }, 403);

    const period = url.searchParams.get('period') || '30d';
    return await getStats(supabase, period);
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
});

async function trackEvent(supabase, req) {
  const body = await req.json();
  const { event, page, productId, sessionId, metadata, userAgent, referrer } = body;

  if (!event) return jsonResponse({ error: 'event est requis' }, 400);

  const record = {
    event,
    page: page || '',
    product_id: productId || null,
    session_id: sessionId || crypto.randomUUID(),
    user_agent: userAgent || '',
    referrer: referrer || '',
    metadata: metadata || {},
    ip_hash: hashIP(req.headers.get('X-Forwarded-For') || req.headers.get('CF-Connecting-IP') || ''),
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('analytics_events').insert(record);
  if (error) return jsonResponse({ error: error.message }, 400);

  // Update product view count
  if (event === 'product_view' && productId) {
    await supabase.rpc('increment_product_views', { product_id: productId });
  }

  return jsonResponse({ success: true });
}

async function getStats(supabase, period) {
  const since = getDateSince(period);

  // Page views
  const { count: pageViews } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', since)
    .eq('event', 'page_view');

  // Unique sessions
  const { data: sessions } = await supabase
    .from('analytics_events')
    .select('session_id')
    .gte('created_at', since);
  const uniqueSessions = new Set(sessions?.map(s => s.session_id)).size;

  // Top pages
  const { data: topPages } = await supabase
    .from('analytics_events')
    .select('page, count')
    .gte('created_at', since)
    .eq('event', 'page_view')
    .neq('page', '')
    .limit(10);

  // Top products viewed
  const { data: topProducts } = await supabase
    .from('analytics_events')
    .select('product_id, count')
    .gte('created_at', since)
    .eq('event', 'product_view')
    .not('product_id', 'is', null)
    .limit(10);

  // Conversions (add_to_cart → purchase)
  const { count: addToCart } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', since)
    .eq('event', 'add_to_cart');

  const { count: purchases } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', since)
    .eq('event', 'purchase');

  const conversionRate = addToCart && addToCart > 0
    ? Math.round((purchases || 0) / addToCart * 10000) / 100
    : 0;

  return jsonResponse({
    period,
    pageViews: pageViews || 0,
    uniqueSessions,
    conversionRate,
    topPages: topPages || [],
    topProducts: topProducts || [],
    addToCart: addToCart || 0,
    purchases: purchases || 0,
  });
}

function hashIP(ip) {
  // Simple hash for privacy — don't store raw IPs
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

function getDateSince(period) {
  const now = new Date();
  switch (period) {
    case '1d': now.setDate(now.getDate() - 1); break;
    case '7d': now.setDate(now.getDate() - 7); break;
    case '30d': now.setDate(now.getDate() - 30); break;
    case '90d': now.setDate(now.getDate() - 90); break;
    default: now.setDate(now.getDate() - 30);
  }
  return now.toISOString();
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
