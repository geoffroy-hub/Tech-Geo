// ===================================================
// Tech-geo — Coupons Edge Function
// ===================================================
// Validate, create, update, delete coupon codes
//
// Deploy: supabase functions deploy coupons
// ===================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const url = new URL(req.url);
  const body = req.method === 'POST' ? await req.json() : {};
  const { action } = body;

  // Public: validate coupon
  if (req.method === 'POST' && action === 'validate') {
    return await validateCoupon(supabase, body);
  }

  // Admin only for everything else
  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!authHeader) return jsonResponse({ error: 'Unauthorized' }, 401);

  const userSupabase = createClient(supabaseUrl, authHeader);
  const { data: { user } } = await userSupabase.auth.getUser(authHeader);
  if (!user) return jsonResponse({ error: 'Invalid token' }, 401);

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return jsonResponse({ error: 'Admin only' }, 403);

  switch (action) {
    case 'create': return await createCoupon(supabase, body);
    case 'update': return await updateCoupon(supabase, body);
    case 'delete': return await deleteCoupon(supabase, body);
    case 'list': return await listCoupons(supabase);
    default: return jsonResponse({ error: 'Action invalide' }, 400);
  }
});

async function validateCoupon(supabase, body) {
  const { code, cartTotal } = body;
  if (!code) return jsonResponse({ error: 'code est requis' }, 400);

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .single();

  if (error || !coupon) return jsonResponse({ valid: false, error: 'Code invalide' });

  // Check expiry
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return jsonResponse({ valid: false, error: 'Code expiré' });
  }

  // Check usage limit
  if (coupon.max_uses && coupon.uses >= coupon.max_uses) {
    return jsonResponse({ valid: false, error: 'Code utilisé au maximum' });
  }

  // Check minimum cart total
  if (coupon.min_total && cartTotal && Number(cartTotal) < Number(coupon.min_total)) {
    return jsonResponse({ valid: false, error: `Minimum ${formatPrice(coupon.min_total)} requis` });
  }

  // Calculate discount
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = Math.round(Number(cartTotal) * Number(coupon.value) / 100);
    if (coupon.max_discount && discount > Number(coupon.max_discount)) {
      discount = Number(coupon.max_discount);
    }
  } else {
    discount = Number(coupon.value);
  }

  return jsonResponse({
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      description: coupon.description,
    },
  });
}

async function createCoupon(supabase, body) {
  const { code, type, value, description, max_uses, max_discount, min_total, expires_at } = body;

  if (!code || !type || value === undefined) {
    return jsonResponse({ error: 'code, type et value sont requis' }, 400);
  }

  if (!['percentage', 'fixed'].includes(type)) {
    return jsonResponse({ error: 'type doit être "percentage" ou "fixed"' }, 400);
  }

  const coupon = {
    code: code.toUpperCase(),
    type,
    value: Number(value),
    description: description || '',
    max_uses: max_uses || null,
    max_discount: max_discount || null,
    min_total: min_total || null,
    expires_at: expires_at || null,
    uses: 0,
    active: body.active !== undefined ? body.active : true,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('coupons').insert(coupon).select().single();

  if (error) return jsonResponse({ error: error.message }, 400);
  return jsonResponse({ success: true, coupon: data }, 201);
}

async function updateCoupon(supabase, body) {
  const { id, ...updates } = body;
  if (!id) return jsonResponse({ error: 'id est requis' }, 400);

  if (updates.code) updates.code = updates.code.toUpperCase();

  const { data, error } = await supabase
    .from('coupons').update(updates).eq('id', id).select().single();

  if (error) return jsonResponse({ error: error.message }, 400);
  return jsonResponse({ success: true, coupon: data });
}

async function deleteCoupon(supabase, body) {
  const { id } = body;
  if (!id) return jsonResponse({ error: 'id est requis' }, 400);

  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) return jsonResponse({ error: error.message }, 400);

  return jsonResponse({ success: true, deletedId: id });
}

async function listCoupons(supabase) {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return jsonResponse({ error: error.message }, 400);
  return jsonResponse({ coupons: data || [] });
}

function formatPrice(n, cur = 'FCFA') { return Number(n).toLocaleString('fr-FR') + ' ' + cur; }
function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
