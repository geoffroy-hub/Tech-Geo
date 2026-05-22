import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, title, body, url, tag } = await req.json();

    let query = supabaseAdmin.from('push_subscriptions').select('subscription');
    if (user_id) query = query.eq('user_id', user_id);

    const { data: subs } = await query;
    if (!subs?.length) return NextResponse.json({ sent: 0 });

    const payload = JSON.stringify({ title, body, url: url || '/', tag: tag || 'techgeo' });
    let sent = 0;

    for (const row of subs) {
      try {
        const sub = JSON.parse(row.subscription);
        const res = await fetch(sub.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream', 'TTL': '86400' },
          body: payload,
        });
        if (res.ok) sent++;
      } catch {}
    }

    return NextResponse.json({ sent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
