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
    return (
      <section className="section" style={{ paddingTop: '6rem', textAlign: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h1 style={{ marginBottom: '0.5rem' }}>Commande confirmée !</h1>
            <p style={{ color: 'var(--clr-muted)', margin: '0.5rem 0 1.5rem', lineHeight: 1.7 }}>
              Un email de récapitulatif a été envoyé à <strong style={{ color: 'var(--clr-accent)' }}>{customer.email}</strong>.<br />
              Nous vous contacterons sous 24h pour finaliser le paiement.
            </p>
            {orderId && (
              <div style={{ background: 'rgba(4,187,255,0.08)', border: '1px solid rgba(4,187,255,0.2)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-muted)' }}>Numéro de commande</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--clr-accent)' }}>#{orderId.slice(0,8).toUpperCase()}</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {orderId && (
                <Link href={`/suivi-commande?id=${orderId}`} className="btn btn-primary">📦 Suivre ma commande</Link>
              )}
              <Link href="/boutique" className="btn btn-outline">Continuer mes achats</Link>
            </div>
          </div>
        </div>
      </section>
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
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      Téléphone
                      <span style={{ fontSize: '0.75rem', color: 'var(--clr-muted)', fontWeight: 400 }}>(Togo)</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '1.1rem',
                        lineHeight: 1,
                        pointerEvents: 'none',
                        zIndex: 1,
                      }}>🇹🇬</span>
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
                        style={{ paddingLeft: '2.5rem' }}
                      />
                    </div>
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
