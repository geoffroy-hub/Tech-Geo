import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'commandes@tech-geo.com';
const ADMIN_EMAIL = 'techgeotg@gmail.com'; // ← ton email admin

// ── Templates HTML ──────────────────────────────────────────────────────────
function orderConfirmationHtml(order: any) {
  const items = order.items?.map((i: any) =>
    `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e8f5f5;">${i.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e8f5f5;text-align:center;">${i.qty || i.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e8f5f5;text-align:right;font-weight:600;">${Number(i.price * (i.qty || i.quantity)).toLocaleString('fr-FR')} FCFA</td>
    </tr>`
  ).join('') || '';

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,60,87,0.12);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#003c57 0%,#051c24 100%);padding:32px 40px;text-align:center;">
      <div style="font-size:2.2rem;margin-bottom:8px;">⚡</div>
      <h1 style="color:#04bbff;margin:0;font-size:1.6rem;letter-spacing:1px;">Tech-Geo</h1>
      <p style="color:#7fa8c0;margin:6px 0 0;font-size:0.9rem;">Votre commande a bien été reçue</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px;">
      <p style="color:#1a3636;font-size:1rem;margin:0 0 8px;">Bonjour <strong>${order.customer?.name || 'Client'}</strong>,</p>
      <p style="color:#5a8a8a;font-size:0.9rem;margin:0 0 24px;line-height:1.6;">
        Merci pour votre commande ! Voici votre récapitulatif. Nous vous contacterons sous <strong>24h</strong> pour organiser le paiement et la livraison.
      </p>

      <!-- Numéro commande -->
      <div style="background:#f0f9ff;border-left:4px solid #04bbff;border-radius:4px;padding:12px 16px;margin-bottom:24px;">
        <span style="color:#5a8a8a;font-size:0.8rem;">Numéro de commande</span>
        <div style="color:#003c57;font-weight:700;font-size:1.05rem;margin-top:2px;">#${order.id?.slice(0,8).toUpperCase()}</div>
      </div>

      <!-- Articles -->
      <h3 style="color:#003c57;margin:0 0 12px;font-size:1rem;">Articles commandés</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <thead>
          <tr style="background:#f0f9ff;">
            <th style="padding:10px 12px;text-align:left;color:#5a8a8a;font-size:0.82rem;font-weight:600;">PRODUIT</th>
            <th style="padding:10px 12px;text-align:center;color:#5a8a8a;font-size:0.82rem;font-weight:600;">QTÉ</th>
            <th style="padding:10px 12px;text-align:right;color:#5a8a8a;font-size:0.82rem;font-weight:600;">PRIX</th>
          </tr>
        </thead>
        <tbody>${items}</tbody>
      </table>

      <!-- Total -->
      <div style="background:#003c57;border-radius:8px;padding:16px 20px;display:flex;justify-content:space-between;margin-bottom:24px;">
        <span style="color:#b0dedf;font-weight:600;">TOTAL À PAYER</span>
        <span style="color:#04bbff;font-weight:800;font-size:1.15rem;">${Number(order.total).toLocaleString('fr-FR')} FCFA</span>
      </div>

      <!-- Infos client -->
      <h3 style="color:#003c57;margin:0 0 12px;font-size:1rem;">Informations de livraison</h3>
      <div style="background:#f8fffe;border:1px solid #c8e8e8;border-radius:8px;padding:16px;">
        <table style="width:100%;font-size:0.88rem;">
          <tr><td style="color:#5a8a8a;padding:4px 0;width:110px;">Nom</td><td style="color:#1a3636;font-weight:600;">${order.customer?.name || '—'}</td></tr>
          <tr><td style="color:#5a8a8a;padding:4px 0;">Email</td><td style="color:#1a3636;">${order.customer?.email || '—'}</td></tr>
          <tr><td style="color:#5a8a8a;padding:4px 0;">Téléphone</td><td style="color:#1a3636;">${order.customer?.phone || '—'}</td></tr>
          <tr><td style="color:#5a8a8a;padding:4px 0;">Adresse</td><td style="color:#1a3636;">${order.customer?.address || '—'}</td></tr>
        </table>
      </div>

      <!-- Paiement -->
      <div style="margin-top:24px;padding:16px;background:#fff8e1;border-radius:8px;border-left:4px solid #f0c040;">
        <p style="margin:0;font-size:0.88rem;color:#5a6040;line-height:1.6;">
          💳 <strong>Paiement accepté :</strong> T-Money · Moov Money · Wave · Espèces<br>
          Nous vous contacterons pour finaliser le paiement.
        </p>
      </div>

      <!-- Suivi -->
      <div style="margin-top:20px;text-align:center;">
        <a href="https://tech-geo.com/suivi-commande?id=${order.id}" 
           style="display:inline-block;background:#04bbff;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:0.9rem;">
          📦 Suivre ma commande
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f0f9ff;padding:20px 40px;text-align:center;border-top:1px solid #c8e8e8;">
      <p style="color:#5a8a8a;font-size:0.82rem;margin:0;">© Tech-Geo Togo · techgeotg@gmail.com</p>
    </div>
  </div>
</body>
</html>`;
}

function statusUpdateHtml(order: any, newStatus: string) {
  const statusMap: Record<string, { label: string; emoji: string; color: string; msg: string }> = {
    processing: { label: 'En cours de traitement', emoji: '⚙️', color: '#f0c040', msg: "Votre commande est en cours de traitement par notre équipe." },
    shipped:    { label: 'Expédié',                emoji: '🚚', color: '#04bbff', msg: "Votre commande est en route ! Vous serez contacté pour la livraison." },
    delivered:  { label: 'Livrée',                emoji: '✅', color: '#4caf50', msg: "Votre commande a été livrée. Merci de votre confiance !" },
    cancelled:  { label: 'Annulée',               emoji: '❌', color: '#ff4757', msg: "Votre commande a été annulée. Contactez-nous pour plus d'informations." },
    pending:    { label: 'En attente',             emoji: '⏳', color: '#7fa8c0', msg: "Votre commande est en attente de confirmation." },
  };
  const s = statusMap[newStatus] || statusMap['pending'];

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,60,87,0.12);">
    <div style="background:linear-gradient(135deg,#003c57 0%,#051c24 100%);padding:28px 36px;text-align:center;">
      <div style="font-size:2.5rem;margin-bottom:6px;">${s.emoji}</div>
      <h2 style="color:#04bbff;margin:0;font-size:1.3rem;">Mise à jour de commande</h2>
    </div>
    <div style="padding:32px 36px;">
      <p style="color:#1a3636;margin:0 0 16px;">Bonjour <strong>${order.customer?.name || 'Client'}</strong>,</p>
      <div style="background:#f8fffe;border:2px solid ${s.color};border-radius:10px;padding:20px;text-align:center;margin-bottom:20px;">
        <div style="font-size:2rem;margin-bottom:8px;">${s.emoji}</div>
        <div style="font-size:1.1rem;font-weight:700;color:${s.color};">${s.label}</div>
        <p style="color:#5a8a8a;font-size:0.88rem;margin:8px 0 0;">${s.msg}</p>
      </div>
      <div style="background:#f0f9ff;border-left:4px solid #04bbff;border-radius:4px;padding:12px 16px;margin-bottom:20px;">
        <span style="color:#5a8a8a;font-size:0.8rem;">Commande</span>
        <div style="color:#003c57;font-weight:700;">#${order.id?.slice(0,8).toUpperCase()} · ${Number(order.total).toLocaleString('fr-FR')} FCFA</div>
      </div>
      <div style="text-align:center;">
        <a href="https://tech-geo.com/suivi-commande?id=${order.id}"
           style="display:inline-block;background:#04bbff;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:0.9rem;">
          📦 Voir le suivi
        </a>
      </div>
    </div>
    <div style="background:#f0f9ff;padding:16px 36px;text-align:center;border-top:1px solid #c8e8e8;">
      <p style="color:#5a8a8a;font-size:0.8rem;margin:0;">© Tech-Geo Togo · techgeotg@gmail.com</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, order } = body; // type: 'confirmation' | 'status_update', order: Order object, newStatus?

    if (!order?.customer?.email) {
      return NextResponse.json({ error: 'Email client manquant' }, { status: 400 });
    }

    if (type === 'confirmation') {
      // Email au client
      await resend.emails.send({
        from: `Tech-Geo <${FROM}>`,
        to: order.customer.email,
        subject: `✅ Commande #${order.id?.slice(0,8).toUpperCase()} confirmée — Tech-Geo`,
        html: orderConfirmationHtml(order),
      });

      // Notification admin
      await resend.emails.send({
        from: `Tech-Geo <${FROM}>`,
        to: ADMIN_EMAIL,
        subject: `🛒 Nouvelle commande #${order.id?.slice(0,8).toUpperCase()} — ${Number(order.total).toLocaleString('fr-FR')} FCFA`,
        html: `<p>Nouvelle commande de <strong>${order.customer.name}</strong> (${order.customer.email}) pour <strong>${Number(order.total).toLocaleString('fr-FR')} FCFA</strong>.</p>
               <p>Articles : ${order.items?.map((i: any) => `${i.name} x${i.qty || i.quantity}`).join(', ')}</p>
               <p>Téléphone : ${order.customer.phone || '—'}</p>
               <p>Adresse : ${order.customer.address || '—'}</p>`,
      });

      // Notification push admin
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-push`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: '🛒 Nouvelle commande !',
            body: `${order.customer?.name} — ${Number(order.total).toLocaleString('fr-FR')} FCFA`,
            url: '/admin',
            tag: 'new-order',
          }),
        });
      } catch {}

      return NextResponse.json({ success: true });
    }

    if (type === 'status_update') {
      const { newStatus } = body;
      await resend.emails.send({
        from: `Tech-Geo <${FROM}>`,
        to: order.customer.email,
        subject: `📦 Commande #${order.id?.slice(0,8).toUpperCase()} — Mise à jour de statut`,
        html: statusUpdateHtml(order, newStatus),
      });
      // Notification push client
      try {
        const { newStatus } = body;
        const statusLabels: Record<string, string> = {
          processing: '⚙️ En cours de traitement',
          shipped: '🚚 En cours de livraison',
          delivered: '✅ Commande livrée !',
          cancelled: '❌ Commande annulée',
          pending: '⏳ En attente',
        };
        if (order.user_id) {
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-push`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: order.user_id,
              title: statusLabels[newStatus] || 'Mise à jour commande',
              body: `Commande #${order.id?.slice(0,8).toUpperCase()} — ${Number(order.total).toLocaleString('fr-FR')} FCFA`,
              url: `/suivi-commande?id=${order.id}`,
              tag: `order-${order.id}`,
            }),
          });
        }
      } catch {}

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Type inconnu' }, { status: 400 });
  } catch (err: any) {
    console.error('Email error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
