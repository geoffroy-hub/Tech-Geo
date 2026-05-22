// ===================================================
// Tech-geo — Process Payment Edge Function
// ===================================================
// Handles payment processing via external APIs
// (Orange Money, Wave, Mobile Money, etc.)
//
// Usage:
//   supabase functions serve --env-file .env
//   curl -X POST http://localhost:54321/functions/v1/process-payment \
//     -H "Authorization: Bearer <anon-key>" \
//     -H "Content-Type: application/json" \
//     -d '{"orderId": "uuid", "method": "orange-money", "phone": "+228..."}'
// ===================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verify auth
  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser(authHeader);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json();
  const { orderId, method, phone } = body;

  if (!orderId || !method) {
    return new Response(
      JSON.stringify({ error: 'orderId and method are required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Fetch order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return new Response(JSON.stringify({ error: 'Order not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Process payment based on method
  let paymentResult;

  switch (method) {
    case 'orange-money':
      paymentResult = await processOrangeMoney(order, phone);
      break;
    case 'wave':
      paymentResult = await processWave(order, phone);
      break;
    case 'cash':
      paymentResult = { success: true, transactionId: 'COD-' + Date.now() };
      break;
    default:
      return new Response(
        JSON.stringify({ error: `Unsupported payment method: ${method}` }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
  }

  if (!paymentResult.success) {
    return new Response(
      JSON.stringify({ error: paymentResult.error || 'Payment failed' }),
      {
        status: 402,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Update order with payment info
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_method: method,
      payment_status: 'paid',
      status: 'processing',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (updateError) {
    console.error('Failed to update order:', updateError);
  }

  return new Response(
    JSON.stringify({
      success: true,
      transactionId: paymentResult.transactionId,
      orderId,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
});

// ===================================================
// Payment Provider Integrations
// ===================================================

async function processOrangeMoney(order, phone) {
  const api = Deno.env.get('ORANGE_MONEY_API_URL');
  const apiKey = Deno.env.get('ORANGE_MONEY_API_KEY');

  if (!api || !apiKey) {
    return { success: false, error: 'Orange Money not configured' };
  }

  try {
    const response = await fetch(`${api}/webpayment/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        merchant_ref: order.id,
        amount: order.total,
        currency: order.currency || 'XOF',
        msisdn: phone,
      }),
    });

    const result = await response.json();
    return { success: response.ok, transactionId: result.transaction_id };
  } catch (error) {
    console.error('Orange Money error:', error);
    return { success: false, error: error.message };
  }
}

async function processWave(order, phone) {
  const api = Deno.env.get('WAVE_API_URL');
  const apiKey = Deno.env.get('WAVE_API_KEY');

  if (!api || !apiKey) {
    return { success: false, error: 'Wave not configured' };
  }

  try {
    const response = await fetch(`${api}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        amount: Math.round(order.total),
        currency: order.currency || 'XOF',
        phone: phone,
        metadata: { order_id: order.id },
      }),
    });

    const result = await response.json();
    return { success: response.ok, transactionId: result.id };
  } catch (error) {
    console.error('Wave error:', error);
    return { success: false, error: error.message };
  }
}
