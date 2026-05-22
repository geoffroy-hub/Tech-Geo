'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import type { Order } from '@/types';

const STEPS = [
  { key: 'pending',    label: 'Commande reçue',     emoji: '📋', desc: 'Votre commande a été enregistrée.' },
  { key: 'processing', label: 'En traitement',       emoji: '⚙️', desc: 'Notre équipe prépare votre commande.' },
  { key: 'shipped',    label: 'Expédiée',            emoji: '🚚', desc: 'Votre commande est en route.' },
  { key: 'delivered',  label: 'Livrée',              emoji: '✅', desc: 'Commande livrée avec succès !' },
];

const STATUS_INDEX: Record<string, number> = {
  pending: 0, processing: 1, shipped: 2, delivered: 3, cancelled: -1,
};

function TrackingContent() {
  const params = useSearchParams();
  const [orderId, setOrderId] = useState(params.get('id') || '');
  const [inputId, setInputId] = useState(params.get('id') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) searchOrder(orderId);
  }, []);

  async function searchOrder(id: string) {
    if (!id.trim()) { setError('Entrez un numéro de commande.'); return; }
    setLoading(true); setError(''); setOrder(null);
    const supabase = getSupabase();
    const { data, error: err } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id.trim())
      .single();
    if (err || !data) {
      setError('Commande introuvable. Vérifiez le numéro et réessayez.');
    } else {
      setOrder(data as Order);
    }
    setLoading(false);
  }

  const currentStep = order ? STATUS_INDEX[order.status] ?? 0 : -1;
  const isCancelled = order?.status === 'cancelled';

  return (
    <>
      <section className="hero-sm" style={{ background: 'linear-gradient(135deg, #003c57 0%, #051c24 100%)' }}>
        <div className="container">
          <h1>📦 Suivi de commande</h1>
          <p>Entrez votre numéro de commande pour suivre son statut en temps réel.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '700px', margin: '0 auto' }}>

          {/* Barre de recherche */}
          <div style={{
            display: 'flex', gap: '0.75rem', marginBottom: '2.5rem',
            background: 'var(--clr-surface)', padding: '1.25rem',
            borderRadius: '12px', border: '1px solid var(--clr-border)',
          }}>
            <input
              type="text"
              value={inputId}
              onChange={e => setInputId(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setOrderId(inputId); searchOrder(inputId); } }}
              placeholder="Ex: A1B2C3D4 ou UUID complet..."
              style={{
                flex: 1, padding: '0.7rem 1rem', borderRadius: '8px',
                border: '1px solid var(--clr-border)', background: 'var(--clr-bg)',
                color: 'var(--clr-text)', fontSize: '0.95rem',
              }}
            />
            <button
              className="btn btn-primary"
              onClick={() => { setOrderId(inputId); searchOrder(inputId); }}
              disabled={loading}
              style={{ whiteSpace: 'nowrap' }}
            >
              {loading ? '⏳' : '🔍 Rechercher'}
            </button>
          </div>

          {error && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#ff4757', background: 'rgba(255,71,87,0.08)', borderRadius: '10px', marginBottom: '1.5rem' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Résultat */}
          {order && (
            <div className="card" style={{ padding: '2rem', overflow: 'visible' }}>

              {/* En-tête commande */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--clr-muted)' }}>Commande</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--clr-accent)' }}>#{order.id.slice(0,8).toUpperCase()}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--clr-muted)', marginTop: '2px' }}>
                    {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--clr-muted)' }}>Total</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--clr-text)' }}>{Number(order.total).toLocaleString('fr-FR')} FCFA</div>
                </div>
              </div>

              {/* Statut annulé */}
              {isCancelled ? (
                <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,71,87,0.08)', borderRadius: '10px', border: '1px solid rgba(255,71,87,0.2)', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>❌</div>
                  <div style={{ fontWeight: 700, color: '#ff4757', fontSize: '1.1rem' }}>Commande annulée</div>
                  <p style={{ color: 'var(--clr-muted)', fontSize: '0.88rem', margin: '0.5rem 0 0' }}>Contactez-nous pour plus d'informations.</p>
                </div>
              ) : (
                /* Timeline des étapes */
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ position: 'relative' }}>
                    {/* Ligne de progression */}
                    <div style={{
                      position: 'absolute', top: '20px', left: '20px',
                      right: '20px', height: '3px',
                      background: 'var(--clr-border)',
                      zIndex: 0,
                    }} />
                    <div style={{
                      position: 'absolute', top: '20px', left: '20px',
                      width: `${Math.max(0, (currentStep / (STEPS.length - 1)) * 100)}%`,
                      height: '3px',
                      background: 'var(--clr-accent)',
                      zIndex: 1,
                      transition: 'width 0.6s ease',
                    }} />

                    {/* Étapes */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                      {STEPS.map((step, i) => {
                        const done = i <= currentStep;
                        const active = i === currentStep;
                        return (
                          <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                            <div style={{
                              width: '40px', height: '40px', borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '1.1rem',
                              background: done ? (active ? 'var(--clr-accent)' : 'rgba(4,187,255,0.2)') : 'var(--clr-surface)',
                              border: `2px solid ${done ? 'var(--clr-accent)' : 'var(--clr-border)'}`,
                              transition: 'all 0.3s',
                              boxShadow: active ? '0 0 16px rgba(4,187,255,0.4)' : 'none',
                            }}>
                              {step.emoji}
                            </div>
                            <div style={{ fontSize: '0.72rem', fontWeight: active ? 700 : 400, color: done ? 'var(--clr-text)' : 'var(--clr-muted)', marginTop: '6px', textAlign: 'center', lineHeight: 1.3 }}>
                              {step.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message statut actuel */}
                  <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(4,187,255,0.07)', border: '1px solid rgba(4,187,255,0.2)', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--clr-text)' }}>
                      {STEPS[currentStep]?.emoji} <strong>{STEPS[currentStep]?.desc}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Articles */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--clr-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Articles</h4>
                {(order.items || []).map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--clr-border)', fontSize: '0.9rem' }}>
                    <span>{item.name} <span style={{ color: 'var(--clr-muted)' }}>×{item.qty || item.quantity}</span></span>
                    <span style={{ fontWeight: 600 }}>{Number(item.price * (item.qty || item.quantity)).toLocaleString('fr-FR')} F</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontWeight: 700, fontSize: '1rem' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--clr-accent)' }}>{Number(order.total).toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              {/* Infos client */}
              <div style={{ padding: '1rem', background: 'var(--clr-bg)', borderRadius: '8px', border: '1px solid var(--clr-border)', fontSize: '0.85rem' }}>
                <div style={{ color: 'var(--clr-muted)', marginBottom: '4px' }}>Livraison à</div>
                <div style={{ fontWeight: 600 }}>{(order.customer as any)?.name}</div>
                <div style={{ color: 'var(--clr-muted)' }}>{(order.customer as any)?.phone} · {(order.customer as any)?.address}</div>
              </div>

              {/* Aide */}
              <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--clr-muted)' }}>
                Un problème ? <a href="mailto:techgeotg@gmail.com" style={{ color: 'var(--clr-accent)' }}>Contactez-nous</a>
              </div>
            </div>
          )}

          {!order && !loading && !error && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <p>Entrez votre numéro de commande pour voir son statut.</p>
              <p style={{ fontSize: '0.82rem' }}>Vous l'avez reçu par email après votre commande.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function SuiviCommandePage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', color: 'var(--clr-muted)' }}>Chargement...</div>}>
      <TrackingContent />
    </Suspense>
  );
}
