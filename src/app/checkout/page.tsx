'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const supabase = getSupabase();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [orderId, setOrderId] = useState('');
  const [customer, setCustomer] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setStatus('loading');
    try {
      const orderPayload = {
        user_id: user?.id || null,
        customer: { name: customer.name, email: customer.email, phone: customer.phone, address: customer.address },
        items: items.map(i => ({ id: i.product_id, name: i.name, price: i.price, qty: i.quantity })),
        total: totalPrice,
        currency: 'FCFA',
        payment_status: 'unpaid',
        status: 'pending',
      };

      const { data: insertedOrder, error } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select()
        .single();
      if (error) throw error;

      // Envoyer l'email de confirmation
      try {
        await fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'confirmation',
            order: { ...insertedOrder, customer: orderPayload.customer, items: orderPayload.items },
          }),
        });
      } catch (emailErr) {
        console.warn('Email non envoyé (config manquante?):', emailErr);
      }

      clearCart();
      setOrderId(insertedOrder?.id || '');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    const orderNum = orderId ? '#' + orderId.slice(0,8).toUpperCase() : '#XXXXXXXX';
    return (
      <div style={{ minHeight: '100vh', paddingTop: '5rem', paddingBottom: '4rem', background: 'var(--clr-dark)', position: 'relative', overflow: 'hidden' }}>
        <style>{`
          @keyframes particleFly {
            0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
            100% { transform: translateY(-120px) rotate(720deg) scale(0); opacity: 0; }
          }
          @keyframes checkPop {
            0%   { transform: scale(0) rotate(-180deg); opacity: 0; }
            60%  { transform: scale(1.2) rotate(10deg); opacity: 1; }
            80%  { transform: scale(0.95) rotate(-5deg); }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes ringPulse {
            0%   { transform: scale(0.8); opacity: 0.8; }
            50%  { transform: scale(1.3); opacity: 0; }
            100% { transform: scale(0.8); opacity: 0; }
          }
          @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
          @keyframes shimmer {
            0%   { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes countUp {
            from { opacity: 0; transform: scale(0.5); }
            to   { opacity: 1; transform: scale(1); }
          }
          .confirm-particle {
            position: absolute;
            width: 8px; height: 8px;
            border-radius: 2px;
            animation: particleFly 1.2s ease-out forwards;
            pointer-events: none;
          }
          .confirm-ring {
            position: absolute; inset: -12px;
            border-radius: 50%;
            border: 2px solid var(--clr-accent);
            animation: ringPulse 1.8s ease-out infinite;
          }
          .confirm-ring-2 {
            position: absolute; inset: -24px;
            border-radius: 50%;
            border: 1px solid rgba(4,187,255,0.3);
            animation: ringPulse 1.8s ease-out 0.4s infinite;
          }
          .confirm-check {
            animation: checkPop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both;
          }
          .confirm-block { animation: slideUp 0.5s ease both; }
          .confirm-block-1 { animation-delay: 0.6s; }
          .confirm-block-2 { animation-delay: 0.8s; }
          .confirm-block-3 { animation-delay: 1.0s; }
          .confirm-block-4 { animation-delay: 1.2s; }
          .confirm-shimmer {
            background: linear-gradient(90deg, transparent 0%, rgba(4,187,255,0.15) 50%, transparent 100%);
            background-size: 200% 100%;
            animation: shimmer 2.5s linear infinite;
          }
          .confirm-order-num {
            animation: countUp 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.9s both;
          }
          .step-dot {
            width: 10px; height: 10px; border-radius: 50%;
            background: var(--clr-accent); flex-shrink: 0;
          }
          .step-line {
            flex: 1; height: 1px;
            background: linear-gradient(90deg, var(--clr-accent), rgba(4,187,255,0.2));
          }
          .confirm-cta:hover { transform: translateY(-2px); transition: transform 0.2s; }
          .confirm-product-row:hover { background: rgba(4,187,255,0.05); }
        `}</style>

        {/* Particules d'explosion au chargement */}
        {[...Array(16)].map((_, i) => (
          <div key={i} className="confirm-particle" style={{
            left: `calc(50% + ${Math.cos(i * 22.5 * Math.PI/180) * 60}px)`,
            top: `calc(180px + ${Math.sin(i * 22.5 * Math.PI/180) * 60}px)`,
            background: i % 3 === 0 ? 'var(--clr-accent)' : i % 3 === 1 ? '#00ff88' : '#ffcc00',
            animationDelay: `${i * 0.05}s`,
            animationDuration: `${0.9 + Math.random() * 0.6}s`,
          }} />
        ))}

        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Icône succès */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative', display: 'inline-block', width: '100%' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div className="confirm-ring" />
              <div className="confirm-ring-2" />
              <div className="confirm-check" style={{
                width: '88px', height: '88px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(4,187,255,0.2), rgba(4,187,255,0.05))',
                border: '2px solid var(--clr-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M8 20L16 28L32 12" stroke="#04BBFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Titre */}
          <div className="confirm-block confirm-block-1" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
              Commande confirmée !
            </h1>
            <p style={{ color: 'var(--clr-muted)', lineHeight: 1.7, margin: 0, fontSize: '1rem' }}>
              Merci <strong style={{ color: 'var(--clr-white)' }}>{customer.name}</strong> — votre commande a bien été reçue.<br />
              Un email a été envoyé à <span style={{ color: 'var(--clr-accent)' }}>{customer.email}</span>
            </p>
          </div>

          {/* Numéro de commande */}
          <div className="confirm-block confirm-block-2" style={{ marginBottom: '1.5rem' }}>
            <div className="confirm-shimmer" style={{
              borderRadius: '14px', border: '1px solid rgba(4,187,255,0.25)',
              padding: '1.25rem 1.5rem', background: 'rgba(4,187,255,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-muted)', marginBottom: '0.3rem' }}>Numéro de commande</div>
                <div className="confirm-order-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--clr-accent)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{orderNum}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-muted)', marginBottom: '0.3rem' }}>Statut</div>
                <span style={{ background: 'rgba(0,255,136,0.12)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '20px', padding: '0.25rem 0.85rem', fontSize: '0.8rem', fontWeight: 700 }}>
                  ● Reçue
                </span>
              </div>
            </div>
          </div>

          {/* Récapitulatif articles */}
          <div className="confirm-block confirm-block-3" style={{
            background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
            borderRadius: '14px', marginBottom: '1.5rem', overflow: 'hidden',
          }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Récapitulatif</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--clr-muted)' }}>{items.length} article{items.length > 1 ? 's' : ''}</span>
            </div>
            {items.map((item, i) => (
              <div key={item.product_id} className="confirm-product-row" style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.85rem 1.25rem',
                borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                transition: 'background 0.2s',
              }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '8px', overflow: 'hidden',
                  background: 'rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  ) : (
                    <span style={{ fontSize: '1.2rem' }}>📦</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--clr-muted)' }}>Qté : {item.quantity}</div>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--clr-accent)', whiteSpace: 'nowrap' }}>
                  {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                </div>
              </div>
            ))}
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(4,187,255,0.03)' }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--clr-accent)' }}>{totalPrice.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>

          {/* Prochaines étapes */}
          <div className="confirm-block confirm-block-4" style={{
            background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
            borderRadius: '14px', padding: '1.25rem', marginBottom: '2rem',
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-muted)', marginBottom: '1rem' }}>Prochaines étapes</div>
            {[
              { icon: '✉️', label: 'Email de confirmation envoyé', sub: 'Vérifiez votre boîte mail' },
              { icon: '📞', label: 'Nous vous contacterons sous 24h', sub: 'Pour finaliser le paiement Mobile Money' },
              { icon: '🚚', label: 'Livraison dans tout le Togo', sub: 'Délai selon votre zone' },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{step.icon}</span>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{step.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--clr-muted)' }}>{step.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Boutons CTA */}
          <div className="confirm-block confirm-block-4" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {orderId && (
              <Link href={`/suivi-commande?id=${orderId}`} className="btn btn-primary confirm-cta" style={{ flex: 1, justifyContent: 'center', minWidth: '160px', gap: '0.5rem' }}>
                📦 Suivre ma commande
              </Link>
            )}
            <Link href="/boutique" className="btn btn-outline confirm-cta" style={{ flex: 1, justifyContent: 'center', minWidth: '160px' }}>
              Continuer mes achats
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return (
    <>
      <section className="hero-sm" style={{ backgroundImage: 'url(/images/tutorial-photos/motherboard-background.webp)' }}>
        <div className="container">
          <h1>Finaliser la commande</h1>
          <p>Récapitulatif de votre panier et informations de livraison.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
              <h2>Votre panier est vide</h2>
              <Link href="/boutique" className="btn btn-primary" style={{ marginTop: '1rem' }}>Voir la boutique</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
              <div>
                <h2 style={{ marginBottom: '1.5rem' }}>Récapitulatif</h2>
                {items.map(item => (
                  <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--clr-border)' }}>
                    <div>
                      <strong>{item.name}</strong>
                      <div style={{ color: 'var(--clr-muted)', fontSize: '0.85rem' }}>Quantité: {item.quantity}</div>
                    </div>
                    <span>{(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  <span>Total</span>
                  <span>{totalPrice.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              <div>
                <h2 style={{ marginBottom: '1.5rem' }}>Informations de livraison</h2>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Nom complet</label>
                    <input type="text" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>
                      Téléphone
                    </label>
                    <input
                        type="tel"
                        value={customer.phone}
                        onChange={e => {
                          const raw = e.target.value;
                          if (raw === '' || raw === '+228 ' || raw === '+228') {
                            setCustomer({...customer, phone: ''});
                            return;
                          }
                          const digits = raw.replace(/\D/g, '');
                          let normalized = digits;
                          if (digits.startsWith('228')) normalized = digits.slice(3);
                          else if (digits.startsWith('00228')) normalized = digits.slice(5);
                          normalized = normalized.slice(0, 8);
                          const parts = [];
                          for (let i = 0; i < normalized.length; i += 2) parts.push(normalized.slice(i, i + 2));
                          const formatted = normalized.length > 0 ? `+228 ${parts.join(' ')}` : '';
                          setCustomer({...customer, phone: formatted});
                        }}
                        onFocus={e => { if (!e.target.value) setCustomer({...customer, phone: '+228 '}); }}
                        onBlur={e => { if (e.target.value === '+228 ' || e.target.value === '+228') setCustomer({...customer, phone: ''}); }}
                        placeholder="+228 XX XX XX XX"
                        maxLength={17}
                        required
                      />
                  </div>
                  <div className="form-group">
                    <label>Adresse de livraison</label>
                    <textarea value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} rows={3} required></textarea>
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--clr-muted)' }}>
                    <strong style={{ color: 'var(--clr-text)' }}>Moyens de paiement acceptés :</strong>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(4,187,255,0.1)', borderRadius: '4px' }}>T-Money</span>
                      <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(4,187,255,0.1)', borderRadius: '4px' }}>Moov Money</span>
                      <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(4,187,255,0.1)', borderRadius: '4px' }}>Wave</span>
                      <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(4,187,255,0.1)', borderRadius: '4px' }}>KKiaPay</span>
                      <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(4,187,255,0.1)', borderRadius: '4px' }}>Espèces</span>
                    </div>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>Nous vous contacterons après validation de la commande pour organiser le paiement.</p>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={status === 'loading'}>
                    {status === 'loading' ? 'Traitement...' : `Confirmer la commande (${totalPrice.toLocaleString('fr-FR')} FCFA)`}
                  </button>
                  {status === 'error' && <div className="auth-error show">Erreur lors de la création de la commande.</div>}
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
