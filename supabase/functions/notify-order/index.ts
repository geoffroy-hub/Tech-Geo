// ===================================================
// Tech-geo — Notify Order Edge Function
// ===================================================
// Sends email notifications for order events
// (new order confirmation, status updates)
//
// Triggered by Supabase Database Webhook or manual call:
//   curl -X POST http://localhost:54321/functions/v1/notify-order \
//     -H "Content-Type: application/json" \
//     -d '{"orderId": "uuid", "type": "confirmation"}'
// ===================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY');
const siteUrl = Deno.env.get('SITE_URL') || 'https://tech-geo.com';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const body = await req.json();
  const { orderId, type } = body;

  if (!orderId) {
    return new Response(JSON.stringify({ error: 'orderId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const notificationType = type || 'confirmation';

  // Fetch order with customer info
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return new Response(JSON.stringify({ error: 'Order not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get customer email
  const customerEmail = order.customer?.email || order.customer?.contact_email;
  const customerName = order.customer?.name || 'Client';

  if (!customerEmail) {
    return new Response(
      JSON.stringify({ error: 'No email found for customer' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  let emailResult;

  switch (notificationType) {
    case 'confirmation':
      emailResult = await sendOrderConfirmation(order, customerEmail, customerName);
      break;
    case 'status_update':
      emailResult = await sendStatusUpdate(order, customerEmail, customerName);
      break;
    case 'admin_notification':
      emailResult = await sendAdminNotification(order);
      break;
    default:
      return new Response(
        JSON.stringify({ error: `Unknown notification type: ${notificationType}` }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
  }

  return new Response(JSON.stringify(emailResult), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

// ===================================================
// Email Templates & Sending
// ===================================================

async function sendOrderConfirmation(order, email, name) {
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not set, skipping email');
    return { sent: false, reason: 'Email provider not configured' };
  }

  const itemsList = order.items
    .map(
      (item) =>
        `<li>${item.name} x${item.qty} — ${formatPrice(item.price * item.qty)}</li>`
    )
    .join('');

  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0066FF;">Merci pour votre commande, ${escapeHtml(name)} !</h1>
      <p>Votre commande <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> a été enregistrée avec succès.</p>
      
      <h2>Récapitulatif</h2>
      <ul>${itemsList}</ul>
      <p><strong>Total: ${formatPrice(order.total)} ${order.currency || 'FCFA'}</strong></p>
      
      <p>Statut: <strong>${translateStatus(order.status)}</strong></p>
      
      <p style="margin-top: 2rem;">
        <a href="${siteUrl}/account.html?tab=orders" 
           style="background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
          Suivre ma commande
        </a>
      </p>
      
      <hr style="margin: 2rem 0; border: none; border-top: 1px solid #e2e8f0;">
      <p style="color: #64748B; font-size: 0.875rem;">Tech-geo — Votre boutique tech de confiance</p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Tech-geo <commandes@tech-geo.com>',
        to: [email],
        subject: `Confirmation de commande #${order.id.slice(0, 8).toUpperCase()}`,
        html,
      }),
    });

    const result = await response.json();
    return { sent: response.ok, id: result.id };
  } catch (error) {
    return { sent: false, error: error.message };
  }
}

async function sendStatusUpdate(order, email, name) {
  if (!resendApiKey) {
    return { sent: false, reason: 'Email provider not configured' };
  }

  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0066FF;">Mise à jour de votre commande</h1>
      <p>Bonjour ${escapeHtml(name)},</p>
      <p>Le statut de votre commande <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> a été mis à jour :</p>
      <p><strong>${translateStatus(order.status)}</strong></p>
      <p>
        <a href="${siteUrl}/account.html?tab=orders" 
           style="background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
          Voir les détails
        </a>
      </p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Tech-geo <commandes@tech-geo.com>',
        to: [email],
        subject: `Commande #${order.id.slice(0, 8).toUpperCase()} — ${translateStatus(order.status)}`,
        html,
      }),
    });

    const result = await response.json();
    return { sent: response.ok, id: result.id };
  } catch (error) {
    return { sent: false, error: error.message };
  }
}

async function sendAdminNotification(order) {
  if (!resendApiKey) {
    return { sent: false, reason: 'Email provider not configured' };
  }

  const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'admin@tech-geo.com';

  const itemsList = order.items
    .map((item) => `- ${item.name} x${item.qty}`)
    .join('\n');

  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #EF4444;">Nouvelle commande reçue !</h1>
      <p>Commande <strong>#${order.id.slice(0, 8).toUpperCase()}</strong></p>
      <p><strong>Client:</strong> ${escapeHtml(order.customer?.name || 'N/A')}</p>
      <p><strong>Email:</strong> ${escapeHtml(order.customer?.email || 'N/A')}</p>
      <p><strong>Total:</strong> ${formatPrice(order.total)} ${order.currency || 'FCFA'}</p>
      <h3>Articles:</h3>
      <pre>${escapeHtml(itemsList)}</pre>
      <p>
        <a href="${siteUrl}/45.html#orders" 
           style="background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
          Gérer la commande
        </a>
      </p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Tech-geo <system@tech-geo.com>',
        to: [adminEmail],
        subject: `[Tech-geo] Nouvelle commande #${order.id.slice(0, 8).toUpperCase()}`,
        html,
      }),
    });

    const result = await response.json();
    return { sent: response.ok, id: result.id };
  } catch (error) {
    return { sent: false, error: error.message };
  }
}

// ===================================================
// Helpers
// ===================================================

function formatPrice(amount, currency = 'FCFA') {
  return Number(amount).toLocaleString('fr-FR') + ' ' + currency;
}

function translateStatus(status) {
  const translations = {
    pending: 'En attente',
    processing: 'En cours de traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };
  return translations[status] || status;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
