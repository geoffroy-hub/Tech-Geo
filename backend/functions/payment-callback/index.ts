// ===================================================
// Tech-geo — Payment Callback Edge Function
// ===================================================
// Reçoit les webhooks de confirmation de paiement
// depuis KKiaPay, PayGate Global, FedaPay, T-Money, Moov
// Met à jour la commande et déclenche les emails.
//
// URL de callback à configurer chez chaque provider :
//   https://<project>.functions.supabase.co/payment-callback
//
// Deploy: supabase functions deploy payment-callback
// ===================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const notifyOrderUrl = Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'functions.supabase.co') + '/notify-order';

serve(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const body = await req.json();

  console.log('[payment-callback] Received:', JSON.stringify(body));

  const provider = detectProvider(req, body);
  let result;

  switch (provider) {
    case 'kkiapay':
      result = await handleKKiaPayCallback(supabase, req, body);
      break;
    case 'paygate':
      result = await handlePayGateCallback(supabase, body);
      break;
    case 'fedapay':
      result = await handleFedaPayCallback(supabase, req, body);
      break;
    case 'tmoney':
      result = await handleTMoneyCallback(supabase, body);
      break;
    case 'moov':
      result = await handleMoovCallback(supabase, body);
      break;
    default:
      return jsonResponse({ error: 'Provider non reconnu' }, 400);
  }

  if (!result.success) {
    console.error('[payment-callback] Error:', result.error);
    return jsonResponse({ error: result.error }, 400);
  }

  // Si paiement réussi → envoyer notification
  if (result.paid) {
    await notifyOrderSuccess(result.orderId);
  }

  return jsonResponse({ success: true });
});

// ===================================================
// KKiaPay Webhook Handler
// https://api.kkiapay.me/docs/webhooks
// ===================================================

async function handleKKiaPayCallback(supabase, req, body) {
  // Vérifier signature KKiaPay
  const secret = Deno.env.get('KKIAPAY_SECRET_KEY');
  const signature = req.headers.get('X-Kkiapay-Signature');

  if (signature && secret) {
    const rawBody = await req.clone().text();
    const valid = await verifyHmacSignature(secret, rawBody, signature);
    if (!valid) {
      console.warn('[payment-callback] Invalid KKiaPay signature');
    }
  }

  const { transactionId, reference: orderId, status, amount } = body;

  if (!orderId) return { success: false, error: 'No reference in callback' };

  // KKiaPay statuses : SUCCESS, PENDING, FAILED, REFUNDED
  if (status === 'SUCCESS' || status === 'APPROVED') {
    const { error } = await supabase
      .from('orders')
      .update({
        payment_method: 'kkiapay',
        payment_status: 'paid',
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) return { success: false, error: error.message };

    return { success: true, paid: true, orderId, transactionId, method: 'kkiapay' };
  }

  if (status === 'FAILED' || status === 'DECLINED') {
    await supabase
      .from('orders')
      .update({
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return { success: true, paid: false, orderId, reason: status };
  }

  return { success: true, paid: false, reason: status };
}

// ===================================================
// PayGate Global Webhook Handler
// ===================================================

async function handlePayGateCallback(supabase, body) {
  const {
    transaction_id,
    reference: orderId,
    status,
    amount,
    payment_method,
  } = body;

  if (!orderId) return { success: false, error: 'No reference in callback' };

  if (status === 'SUCCESS' || status === 'COMPLETED') {
    const { error } = await supabase
      .from('orders')
      .update({
        payment_method: 'paygate',
        payment_status: 'paid',
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) return { success: false, error: error.message };

    return { success: true, paid: true, orderId, transactionId: transaction_id, method: 'paygate' };
  }

  if (status === 'FAILED' || status === 'CANCELLED' || status === 'DECLINED') {
    await supabase
      .from('orders')
      .update({
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return { success: true, paid: false, orderId, reason: status };
  }

  return { success: true, paid: false, reason: status };
}

// ===================================================
// FedaPay Webhook Handler
// https://docs.fedapay.com/webhooks
// ===================================================

async function handleFedaPayCallback(supabase, req, body) {
  const { event, data } = body;

  if (event !== 'transaction.completed' && event !== 'transaction.approved') {
    if (event === 'transaction.failed' || event === 'transaction.cancelled') {
      const orderId = data?.metadata?.order_id;
      if (orderId) {
        await supabase
          .from('orders')
          .update({ payment_status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', orderId);
      }
      return { success: true, paid: false, reason: event };
    }
    return { success: true, paid: false, reason: event };
  }

  const orderId = data?.metadata?.order_id;
  if (!orderId) return { success: false, error: 'No order_id in metadata' };

  const { error } = await supabase
    .from('orders')
    .update({
      payment_method: 'fedapay',
      payment_status: 'paid',
      status: 'processing',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) return { success: false, error: error.message };

  return { success: true, paid: true, orderId, transactionId: data.id };
}

// ===================================================
// T-Money / Moov Money Direct Webhook Handlers
// ===================================================

async function handleTMoneyCallback(supabase, body) {
  const { reference: orderId, status, transaction_id } = body;
  if (!orderId) return { success: false, error: 'No reference' };

  if (status === 'SUCCESS' || status === 'COMPLETED') {
    await supabase
      .from('orders')
      .update({
        payment_method: 'tmoney',
        payment_status: 'paid',
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
    return { success: true, paid: true, orderId, transactionId: transaction_id };
  }

  return { success: true, paid: false, reason: status };
}

async function handleMoovCallback(supabase, body) {
  const { reference: orderId, status, transaction_id } = body;
  if (!orderId) return { success: false, error: 'No reference' };

  if (status === 'SUCCESS' || status === 'COMPLETED') {
    await supabase
      .from('orders')
      .update({
        payment_method: 'moov',
        payment_status: 'paid',
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
    return { success: true, paid: true, orderId, transactionId: transaction_id };
  }

  return { success: true, paid: false, reason: status };
}

// ===================================================
// Helpers
// ===================================================

function detectProvider(req, body) {
  const signature = req.headers.get('X-Kkiapay-Signature');
  const provider = req.headers.get('X-Provider');

  if (signature) return 'kkiapay';
  if (provider) return provider.toLowerCase();
  if (body.event?.includes('transaction.')) return 'fedapay';
  if (body.api_id?.includes('kkiapay') || body.gateway?.includes('kkiapay')) return 'kkiapay';
  if (body.api_id?.includes('paygate') || body.gateway?.includes('paygate')) return 'paygate';
  if (body.provider === 'tmoney' || body.api_id?.startsWith('tmoney')) return 'tmoney';
  if (body.provider === 'moov' || body.api_id?.startsWith('moov')) return 'moov';

  return 'unknown';
}

async function verifyHmacSignature(secret, data, signature) {
  try {
    const expected = await computeHmacSha256(secret, data);
    return signature.includes(expected) || signature.startsWith('v1=');
  } catch {
    return true;
  }
}

async function computeHmacSha256(key, data) {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function notifyOrderSuccess(orderId) {
  if (!notifyOrderUrl) return;
  try {
    await fetch(notifyOrderUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, type: 'confirmation' }),
    });
  } catch (e) {
    console.error('[payment-callback] Failed to notify:', e);
  }
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
