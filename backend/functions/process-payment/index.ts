// ===================================================
// Tech-geo — Process Payment Edge Function (Togo)
// ===================================================
// Paiement via KKiaPay, PayGate Global, FedaPay,
// T-Money, Moov Money, Cash on Delivery
//
// Deploy:   supabase functions deploy process-payment
// Local:    supabase functions serve --env-file .env
// ===================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!authHeader) return jsonResponse({ error: 'Unauthorized' }, 401);

  const { data: { user } } = await supabase.auth.getUser(authHeader);
  if (!user) return jsonResponse({ error: 'Token invalide' }, 401);

  const body = await req.json();
  const { orderId, method, phone, email } = body;

  if (!orderId || !method) {
    return jsonResponse({ error: 'orderId et method sont requis' }, 400);
  }

  const { data: order, error: orderError } = await supabase
    .from('orders').select('*').eq('id', orderId).single();

  if (orderError || !order) return jsonResponse({ error: 'Commande introuvable' }, 404);

  let paymentResult;
  switch (method) {
    case 'kkiapay':
      paymentResult = await processKKiaPay(order, phone, email);
      break;
    case 'paygate':
      paymentResult = await processPayGateGlobal(order, phone, email);
      break;
    case 'fedapay':
      paymentResult = await processFedaPay(order, phone);
      break;
    case 'tmoney':
      paymentResult = await processTMoney(order, phone);
      break;
    case 'moov':
      paymentResult = await processMoovMoney(order, phone);
      break;
    case 'cash':
      paymentResult = { success: true, transactionId: 'COD-' + Date.now() };
      break;
    default:
      return jsonResponse({ error: `Méthode non supportée : ${method}. Options : kkiapay, paygate, fedapay, tmoney, moov, cash` }, 400);
  }

  if (!paymentResult.success) {
    return jsonResponse({ error: paymentResult.error || 'Paiement échoué' }, 402);
  }

  // Mise à jour de la commande
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_method: method,
      payment_status: paymentResult.immediate ? 'paid' : 'pending',
      status: paymentResult.immediate ? 'processing' : 'pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (updateError) {
    console.error('[process-payment] Update order error:', updateError.message);
  }

  return jsonResponse({
    success: true,
    transactionId: paymentResult.transactionId,
    orderId,
    method,
    redirectUrl: paymentResult.redirectUrl,
    authorizeUrl: paymentResult.authorizeUrl,
    promptSent: paymentResult.promptSent,
    immediate: paymentResult.immediate,
  });
});

// ===================================================
// KKiaPay (Agrégateur — Togo, Bénin, Côte d'Ivoire)
// https://kkia.io — Docs : https://api.kkiapay.me/docs
// Supporte : T-Money, Moov Money, Visa/Mastercard, Wave
// ===================================================

async function processKKiaPay(order, phone, email) {
  const apiKey = Deno.env.get('KKIAPAY_PUBLIC_KEY');
  const apiSecret = Deno.env.get('KKIAPAY_SECRET_KEY');
  const apiId = Deno.env.get('KKIAPAY_API_ID');

  if (!apiKey || !apiSecret) {
    return { success: false, error: 'KKiaPay non configuré' };
  }

  const amount = Number(order.total);
  const currency = 'XOF';
  const callbackUrl = Deno.env.get('PAYMENT_CALLBACK_URL') || '';
  const siteUrl = Deno.env.get('SITE_URL') || '';

  try {
    // Créer une transaction KKiaPay
    const res = await fetch('https://api.kkiapay.me/api/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'X-Api-Secret': apiSecret,
      },
      body: JSON.stringify({
        amount,
        currency,
        phone: normalizePhone(phone, 'TG'),
        email: email || order.customer?.email || '',
        reason: `Commande Tech-geo #${order.id.slice(0, 8)}`,
        reference: order.id,
        callback_url: callbackUrl,
        sandbox: Deno.env.get('KKIAPAY_SANDBOX') === 'true' || false,
      }),
    });

    const result = await res.json();

    if (res.ok) {
      // KKiaPay retourne un authorize_url pour rediriger le client
      // ou lance le prompt mobile money directement
      return {
        success: true,
        transactionId: result.transactionId || result.id,
        authorizeUrl: result.authorize_url || result.url,
        redirectUrl: result.redirect_url || result.authorize_url,
        promptSent: result.status === 'PENDING',
        immediate: result.status === 'SUCCESS' || result.status === 'APPROVED',
        status: result.status,
      };
    }

    return { success: false, error: result.message || result.error || 'Erreur KKiaPay' };
  } catch (e) {
    console.error('KKiaPay error:', e);
    return { success: false, error: 'Erreur de connexion KKiaPay' };
  }
}

// ===================================================
// PayGate Global (Agrégateur — Afrique de l'Ouest)
// https://paygateglobal.com
// Supporte : T-Money, Moov Money, cartes bancaires
// ===================================================

async function processPayGateGlobal(order, phone, email) {
  const apiKey = Deno.env.get('PAYGATE_API_KEY');
  const apiSecret = Deno.env.get('PAYGATE_API_SECRET');
  const merchantId = Deno.env.get('PAYGATE_MERCHANT_ID');

  if (!apiKey || !apiSecret) {
    return { success: false, error: 'PayGate Global non configuré' };
  }

  const apiUrl = Deno.env.get('PAYGATE_API_URL') || 'https://api.paygateglobal.com';
  const amount = Number(order.total);
  const currency = order.currency === 'FCFA' ? 'XOF' : (order.currency || 'XOF');
  const callbackUrl = Deno.env.get('PAYMENT_CALLBACK_URL') || '';

  try {
    // Initialiser le paiement
    const res = await fetch(`${apiUrl}/api/v1/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'X-API-Secret': apiSecret,
        'X-Merchant-Id': merchantId || '',
      },
      body: JSON.stringify({
        amount,
        currency,
        reference: order.id,
        description: `Commande Tech-geo #${order.id.slice(0, 8)}`,
        callback_url: callbackUrl,
        redirect_url: Deno.env.get('SITE_URL') + '/payment-callback.html',
        customer: {
          phone: normalizePhone(phone, 'TG'),
          email: email || order.customer?.email || '',
          name: order.customer?.name || 'Client',
        },
        // Demander le prompt mobile money
        payment_method: 'mobile_money',
        network: detectNetwork(phone),
      }),
    });

    const result = await res.json();

    if (res.ok && result.success) {
      return {
        success: true,
        transactionId: result.transaction_id || result.id,
        authorizeUrl: result.checkout_url || result.payment_url,
        redirectUrl: result.checkout_url || result.payment_url,
        promptSent: result.prompt_sent || false,
        immediate: result.status === 'SUCCESS' || result.status === 'COMPLETED',
        status: result.status,
        // Code USSD à afficher si pas de prompt automatique
        ussdCode: result.ussd_code,
        ussdInstructions: result.ussd_instructions,
      };
    }

    return { success: false, error: result.message || result.error || 'Erreur PayGate' };
  } catch (e) {
    console.error('PayGate Global error:', e);
    return { success: false, error: 'Erreur de connexion PayGate Global' };
  }
}

// ===================================================
// FedaPay (Agrégateur — Togo, Bénin, etc.)
// https://fedapay.com
// ===================================================

async function processFedaPay(order, phone) {
  const apiKey = Deno.env.get('FEDAPAY_SECRET_KEY');
  if (!apiKey) return { success: false, error: 'FedaPay non configuré' };

  const amount = Number(order.total);
  const currency = order.currency === 'FCFA' ? 'XOF' : (order.currency || 'XOF');

  try {
    const res = await fetch('https://api.fedapay.com/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(apiKey + ':')}`,
      },
      body: JSON.stringify({
        amount,
        currency: { iso: currency },
        description: `Commande Tech-geo #${order.id.slice(0, 8)}`,
        customer: {
          phone_number: {
            number: normalizePhone(phone, 'TG'),
            country: 'TG',
          },
        },
        metadata: { order_id: order.id },
      }),
    });

    const result = await res.json();

    if (res.ok && result.vtoken) {
      const chargeRes = await fetch(`https://api.fedapay.com/v1/transactions/${result.id}/charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(apiKey + ':')}`,
        },
        body: JSON.stringify({
          token: result.vtoken,
          phone_number: {
            number: normalizePhone(phone, 'TG'),
            country: 'TG',
          },
        }),
      });

      const chargeResult = await chargeRes.json();

      if (chargeRes.ok) {
        return {
          success: true,
          transactionId: result.id,
          promptSent: true,
          immediate: chargeResult.status === 'approved',
          status: chargeResult.status,
        };
      }
    }

    return { success: false, error: result.message || 'Erreur FedaPay' };
  } catch (e) {
    console.error('FedaPay error:', e);
    return { success: false, error: 'Erreur de connexion FedaPay' };
  }
}

// ===================================================
// T-Money (Togocel) — Direct API
// ===================================================

async function processTMoney(order, phone) {
  const api = Deno.env.get('TMONEY_API_URL');
  const apiKey = Deno.env.get('TMONEY_API_KEY');

  if (!api || !apiKey) {
    return { success: false, error: 'T-Money non configuré' };
  }

  const amount = Number(order.total);
  const currency = order.currency === 'FCFA' ? 'XOF' : (order.currency || 'XOF');

  try {
    const res = await fetch(`${api}/v1/payment/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        amount,
        currency,
        phone: normalizePhone(phone, 'TG'),
        reference: order.id,
        description: `Commande Tech-geo #${order.id.slice(0, 8)}`,
        callback_url: Deno.env.get('PAYMENT_CALLBACK_URL') || '',
      }),
    });

    const result = await res.json();

    if (res.ok) {
      return {
        success: true,
        transactionId: result.transaction_id || result.id,
        ussdCode: result.ussd_code,
        promptSent: result.prompt_sent || false,
        immediate: result.status === 'SUCCESS' || result.status === 'COMPLETED',
      };
    }

    return { success: false, error: result.message || result.error || 'Erreur T-Money' };
  } catch (e) {
    console.error('T-Money error:', e);
    return { success: false, error: 'Erreur de connexion T-Money' };
  }
}

// ===================================================
// Moov Money (Moov Africa Togo) — Direct API
// ===================================================

async function processMoovMoney(order, phone) {
  const api = Deno.env.get('MOOV_API_URL');
  const apiKey = Deno.env.get('MOOV_API_KEY');

  if (!api || !apiKey) {
    return { success: false, error: 'Moov Money non configuré' };
  }

  const amount = Number(order.total);
  const currency = order.currency === 'FCFA' ? 'XOF' : (order.currency || 'XOF');

  try {
    const res = await fetch(`${api}/v1/payment/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        amount,
        currency,
        phone: normalizePhone(phone, 'TG'),
        reference: order.id,
        description: `Commande Tech-geo #${order.id.slice(0, 8)}`,
        callback_url: Deno.env.get('PAYMENT_CALLBACK_URL') || '',
      }),
    });

    const result = await res.json();

    if (res.ok) {
      return {
        success: true,
        transactionId: result.transaction_id || result.id,
        ussdCode: result.ussd_code,
        promptSent: result.prompt_sent || false,
        immediate: result.status === 'SUCCESS' || result.status === 'COMPLETED',
      };
    }

    return { success: false, error: result.message || result.error || 'Erreur Moov Money' };
  } catch (e) {
    console.error('Moov Money error:', e);
    return { success: false, error: 'Erreur de connexion Moov Money' };
  }
}

// ===================================================
// Helpers
// ===================================================

function detectNetwork(phone) {
  const cleaned = phone.replace(/[\s\-\.\(\+)]/g, '');
  // Togo : T-Money = 90/91/92/93, Moov = 96/97/98/99
  const prefix = cleaned.length > 8 ? cleaned.slice(-8).slice(0, 2) : cleaned.slice(0, 2);
  const prefix8 = cleaned.length === 8 ? cleaned.slice(0, 2) : null;

  if (prefix8) {
    if (['90', '91', '92', '93'].includes(prefix8)) return 'tmoney';
    if (['96', '97', '98', '99', '70', '71'].includes(prefix8)) return 'moov';
  }
  return null;
}

function normalizePhone(phone, country = 'TG') {
  if (!phone) return '';
  let cleaned = phone.replace(/[\s\-\.\(\)]/g, '');

  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('00')) return '+' + cleaned.slice(2);

  if (cleaned.startsWith('0') && cleaned.length === 9) {
    return '+228' + cleaned.slice(1);
  }
  if (cleaned.length === 8) return '+228' + cleaned;

  return cleaned;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
