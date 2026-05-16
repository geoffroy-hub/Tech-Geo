// ===================================================
// Tech-geo — Notify Order Edge Function
// ===================================================
// Sends email notifications for order events via Resend
//
// Deploy: supabase functions deploy notify-order
// ===================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendKey = Deno.env.get('RESEND_API_KEY');
const siteUrl = Deno.env.get('SITE_URL') || 'https://tech-geo.com';

serve(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const body = await req.json();
  const { orderId, type } = body;

  if (!orderId) return jsonResponse({ error: 'orderId is required' }, 400);

  const { data: order, error } = await supabase
    .from('orders').select('*').eq('id', orderId).single();

  if (error || !order) return jsonResponse({ error: 'Order not found' }, 404);

  const email = order.customer?.email || order.customer?.contact_email;
  const name = order.customer?.name || 'Client';
  if (!email) return jsonResponse({ error: 'No email found' }, 400);

  let result;
  switch (type || 'confirmation') {
    case 'confirmation':
      result = await sendOrderConfirmation(order, email, name);
      break;
    case 'status_update':
      result = await sendStatusUpdate(order, email, name);
      break;
    case 'admin_notification':
      result = await sendAdminNotification(order);
      break;
    default:
      return jsonResponse({ error: `Unknown type: ${type}` }, 400);
  }

  return jsonResponse(result);
});

async function sendOrderConfirmation(order, email, name) {
  if (!resendKey) return { sent: false, reason: 'Email not configured' };

  const shortId = order.id.slice(0, 8).toUpperCase();
  const items = order.items.map(i => `<li>${esc(i.name)} x${i.qty} — ${formatPrice(i.price * i.qty)}</li>`).join('');

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
      <h1 style="color:#0066FF">Merci ${esc(name)} !</h1>
      <p>Commande <strong>#${shortId}</strong> enregistrée.</p>
      <ul>${items}</ul>
      <p><strong>Total: ${formatPrice(order.total)} ${order.currency || 'FCFA'}</strong></p>
      <p>Statut: <strong>${statusLabel(order.status)}</strong></p>
      <a href="${siteUrl}/account.html?tab=orders" style="display:inline-block;background:#0066FF;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;margin-top:1rem">Suivre ma commande</a>
    </div>`;

  return sendEmail('Tech-geo <commandes@tech-geo.com>', email, `Confirmation #${shortId}`, html);
}

async function sendStatusUpdate(order, email, name) {
  if (!resendKey) return { sent: false, reason: 'Email not configured' };

  const shortId = order.id.slice(0, 8).toUpperCase();
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
      <h1 style="color:#0066FF">Mise à jour de votre commande</h1>
      <p>Bonjour ${esc(name)}, le statut de la commande <strong>#${shortId}</strong> est maintenant :</p>
      <p><strong>${statusLabel(order.status)}</strong></p>
      <a href="${siteUrl}/account.html?tab=orders" style="display:inline-block;background:#0066FF;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px">Voir les détails</a>
    </div>`;

  return sendEmail('Tech-geo <commandes@tech-geo.com>', email, `Commande #${shortId} — ${statusLabel(order.status)}`, html);
}

async function sendAdminNotification(order) {
  if (!resendKey) return { sent: false, reason: 'Email not configured' };

  const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'admin@tech-geo.com';
  const shortId = order.id.slice(0, 8).toUpperCase();
  const items = order.items.map(i => `- ${esc(i.name)} x${i.qty}`).join('\n');

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
      <h1 style="color:#EF4444">Nouvelle commande !</h1>
      <p><strong>#${shortId}</strong></p>
      <p>Client: ${esc(order.customer?.name || 'N/A')} (${esc(order.customer?.email || 'N/A')})</p>
      <p>Total: <strong>${formatPrice(order.total)} ${order.currency || 'FCFA'}</strong></p>
      <pre>${esc(items)}</pre>
      <a href="${siteUrl}/45.html#orders" style="display:inline-block;background:#0066FF;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px">Gérer</a>
    </div>`;

  return sendEmail('Tech-geo <system@tech-geo.com>', adminEmail, `[Tech-geo] Nouvelle commande #${shortId}`, html);
}

async function sendEmail(from, to, subject, html) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    const result = await res.json();
    return { sent: res.ok, id: result.id };
  } catch (e) {
    return { sent: false, error: e.message };
  }
}

function formatPrice(n, cur = 'FCFA') { return Number(n).toLocaleString('fr-FR') + ' ' + cur; }
function statusLabel(s) {
  return { pending:'En attente', processing:'En cours', shipped:'Expédiée', delivered:'Livrée', cancelled:'Annulée' }[s] || s;
}
function esc(t) { return t ? String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }
function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
