// ===================================================
// Tech-geo — Notify Contact Edge Function
// ===================================================
// Sends admin notification when a new contact message arrives
//
// Deploy: supabase functions deploy notify-contact
// ===================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendKey = Deno.env.get('RESEND_API_KEY');
const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'admin@tech-geo.com';
const siteUrl = Deno.env.get('SITE_URL') || 'https://tech-geo.com';

serve(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const body = await req.json();
  const { messageId } = body;

  if (!messageId) return jsonResponse({ error: 'messageId is required' }, 400);

  const { data: message, error } = await supabase
    .from('contact_messages').select('*').eq('id', messageId).single();

  if (error || !message) return jsonResponse({ error: 'Message not found' }, 404);

  if (!resendKey) return jsonResponse({ sent: false, reason: 'Email not configured' });

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
      <h1 style="color:#0066FF">Nouveau message de contact</h1>
      <p><strong>De:</strong> ${esc(message.name)} (${esc(message.email)})</p>
      ${message.phone ? `<p><strong>Téléphone:</strong> ${esc(message.phone)}</p>` : ''}
      ${message.subject ? `<p><strong>Sujet:</strong> ${esc(message.subject)}</p>` : ''}
      <h3>Message:</h3>
      <div style="background:#f8fafc;padding:16px;border-radius:8px;border-left:4px solid #0066FF">
        ${esc(message.message).replace(/\n/g, '<br>')}
      </div>
      <p style="margin-top:1.5rem">
        <a href="${siteUrl}/45.html#messages" style="display:inline-block;background:#0066FF;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px">Voir dans l'admin</a>
      </p>
    </div>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: 'Tech-geo <system@tech-geo.com>',
        to: [adminEmail],
        subject: `[Tech-geo] Nouveau message de ${message.name}`,
        html,
      }),
    });
    const result = await res.json();
    return jsonResponse({ sent: res.ok, id: result.id });
  } catch (e) {
    return jsonResponse({ sent: false, error: e.message });
  }
});

function esc(t) { return t ? String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }
function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
