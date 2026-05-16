// ===================================================
// Tech-geo — Generate Receipt Edge Function
// ===================================================
// Génère un reçu/facture PDF pour une commande
//
// Deploy: supabase functions deploy generate-receipt
// ===================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const siteUrl = Deno.env.get('SITE_URL') || 'https://tech-geo.com';

serve(async (req) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const url = new URL(req.url);
  const orderId = url.searchParams.get('orderId') || (await req.json()).orderId;

  if (!orderId) return jsonResponse({ error: 'orderId est requis' }, 400);

  const { data: order, error } = await supabase
    .from('orders').select('*').eq('id', orderId).single();

  if (error || !order) return jsonResponse({ error: 'Commande introuvable' }, 404);

  const html = generateReceiptHTML(order);
  const pdf = await htmlToPDF(html);

  if (pdf) {
    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture-tech-geo-${orderId.slice(0, 8)}.pdf"`,
      },
    });
  }

  // Fallback: return HTML
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
});

function generateReceiptHTML(order) {
  const shortId = order.id.slice(0, 8).toUpperCase();
  const date = new Date(order.created_at).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const itemsRows = (order.items || []).map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0">${esc(item.name)}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center">${item.qty}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right">${formatPrice(item.price)}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right">${formatPrice(item.price * item.qty)}</td>
    </tr>
  `).join('');

  const statusLabel = {
    pending: 'En attente', processing: 'En cours', shipped: 'Expédiée',
    delivered: 'Livrée', cancelled: 'Annulée',
  }[order.status] || order.status;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Facture ${shortId}</title>
<style>
  body { font-family: 'Inter', -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #0f172a; }
  .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 32px; }
  .logo { font-size: 24px; font-weight: 700; color: #0066FF; }
  .invoice-id { text-align: right; }
  .invoice-id h1 { margin: 0; font-size: 28px; }
  .invoice-id p { margin: 4px 0 0; color: #64748b; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  .info-box { background: #f8fafc; padding: 16px; border-radius: 8px; }
  .info-box h3 { margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; }
  .info-box p { margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #0066FF; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; }
  .total-row td { padding-top: 16px; font-size: 18px; font-weight: 700; border-top: 2px solid #0066FF; }
  .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; }
  .badge-paid { background: #d1fae5; color: #065f46; }
  .badge-unpaid { background: #fef3c7; color: #92400e; }
  .badge-refunded { background: #fee2e2; color: #991b1b; }
</style></head><body>
  <div class="header">
    <div>
      <div class="logo">Tech-geo</div>
      <p style="color:#64748b;margin:4px 0 0">Votre boutique tech de confiance</p>
    </div>
    <div class="invoice-id">
      <h1>FACTURE</h1>
      <p>#${shortId}</p>
      <p>${date}</p>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h3>Client</h3>
      <p><strong>${esc(order.customer?.name || 'Client')}</strong></p>
      <p>${esc(order.customer?.email || '')}</p>
      <p>${esc(order.customer?.phone || '')}</p>
      ${order.shipping_address ? `<p>${esc(order.shipping_address)}</p>` : ''}
    </div>
    <div class="info-box">
      <h3>Paiement</h3>
      <p>Méthode: ${esc(order.payment_method || 'Non défini')}</p>
      <p>Statut: <span class="badge badge-${order.payment_status}">${statusLabel}</span></p>
      ${order.payment_method === 'cash' ? '<p>Paiement à la livraison</p>' : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Article</th>
        <th style="text-align:center">Qté</th>
        <th style="text-align:right">Prix unit.</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
      <tr class="total-row">
        <td colspan="3" style="text-align:right"><strong>Total</strong></td>
        <td style="text-align:right"><strong>${formatPrice(order.total)} ${order.currency || 'FCFA'}</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>Tech-geo — ${siteUrl}</p>
    <p>Merci pour votre achat !</p>
  </div>
</body></html>`;
}

async function htmlToPDF(html) {
  // Try using a PDF conversion service
  const apiKey = Deno.env.get('PDF_API_KEY');
  if (apiKey) {
    try {
      const res = await fetch('https://api.html2pdf.app/v1/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ html, pageSize: 'A4', margin: 20 }),
      });
      if (res.ok) return await res.arrayBuffer();
    } catch { /* fallback to HTML */ }
  }
  return null;
}

function formatPrice(n, cur = 'FCFA') { return Number(n).toLocaleString('fr-FR') + ' ' + cur; }
function esc(t) { return t ? String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }
function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
