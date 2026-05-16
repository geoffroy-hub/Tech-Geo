'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';

// ── VAPID public key (à remplacer par la tienne depuis Supabase ou générer)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export default function PushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    // Vérifier si déjà abonné
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      if (sub) { setSubscribed(true); return; }

      // Afficher la bannière après 5s si pas encore demandé
      const asked = localStorage.getItem('tg-push-asked');
      if (!asked && Notification.permission === 'default') {
        setTimeout(() => setShow(true), 5000);
      }
    });

    setPermission(Notification.permission);
  }, []);

  async function subscribe() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY
          ? urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          : undefined,
      });

      // Sauvegarder la subscription dans Supabase
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('push_subscriptions').upsert({
          user_id: session.user.id,
          subscription: JSON.stringify(sub),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      }

      setSubscribed(true);
      setPermission('granted');
      setShow(false);
      localStorage.setItem('tg-push-asked', '1');

      // Notification de bienvenue
      reg.showNotification('Tech-Geo 🎉', {
        body: 'Notifications activées ! Vous serez alerté de vos commandes.',
        icon: '/images/Logo/android-chrome-192x192.webp',
        badge: '/images/Logo/favicon-96x96.webp',
      });
    } catch (err) {
      console.error('Push subscribe error:', err);
      localStorage.setItem('tg-push-asked', '1');
      setShow(false);
    }
  }

  function dismiss() {
    localStorage.setItem('tg-push-asked', '1');
    setShow(false);
  }

  if (!show || subscribed || permission === 'denied') return null;

  return (
    <div style={{
      position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
      background: 'var(--clr-card, #0d2233)', border: '1px solid var(--clr-accent, #04bbff)',
      borderRadius: '16px', padding: '1rem 1.25rem', zIndex: 9999,
      boxShadow: '0 8px 32px rgba(4,187,255,0.2)', maxWidth: '360px', width: '90%',
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
      animation: 'slideUp 0.3s ease',
    }}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🔔</span>
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: 'var(--clr-text, #fff)', fontSize: '0.95rem' }}>
            Activer les notifications
          </p>
          <p style={{ margin: 0, color: 'var(--clr-muted, #7fa8c0)', fontSize: '0.8rem' }}>
            Soyez alerté du statut de vos commandes en temps réel.
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={subscribe} style={{
          flex: 1, background: 'var(--clr-accent, #04bbff)', color: '#000',
          border: 'none', borderRadius: '8px', padding: '0.5rem',
          fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
        }}>
          Activer ✓
        </button>
        <button onClick={dismiss} style={{
          flex: 1, background: 'transparent', color: 'var(--clr-muted, #7fa8c0)',
          border: '1px solid var(--clr-muted, #7fa8c0)', borderRadius: '8px',
          padding: '0.5rem', cursor: 'pointer', fontSize: '0.85rem',
        }}>
          Plus tard
        </button>
      </div>
    </div>
  );
}
