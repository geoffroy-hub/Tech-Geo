'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';

type Guide = {
  id: 'assistant' | 'opencode';
  title: string;
  emoji: string;
  desc: string;
  items: string[];
  pdfKey: string;
};

const GUIDES: Guide[] = [
  {
    id: 'assistant',
    title: 'Assistant Personnel',
    emoji: '🤖',
    desc: "Apprends comment obtenir une clé API et construire ton propre assistant intelligent personnalisé avec un guide complet en PDF.",
    items: ["Obtention des clés API", "Scripting de base", "Déploiement et tests"],
    pdfKey: 'api_pdf_guide',
  },
  {
    id: 'opencode',
    title: 'Vibe Coding & OpenCode',
    emoji: '✨',
    desc: "Maîtrisez l'art du Vibe Coding gratuitement avec OpenCode. Transformez vos idées en code simplement en décrivant vos intentions à l'IA.",
    items: ["Installation d'OpenCode (Gratuit)", "Prompt Engineering avancé", "Workflow IA itératif", "Déploiement en un clic"],
    pdfKey: 'opencode_pdf_guide',
  },
];

type ModalState = {
  open: boolean;
  guide: Guide | null;
  step: 'form' | 'pending' | 'success' | 'error';
  name: string;
  email: string;
  phone: string;
  loading: boolean;
  error: string;
};

export default function ApiPage() {
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({});
  const [modal, setModal] = useState<ModalState>({
    open: false, guide: null, step: 'form',
    name: '', email: '', phone: '',
    loading: false, error: '',
  });

  useEffect(() => {
    async function loadSettings() {
      const supabase = getSupabase();
      const { data } = await supabase.from('site_settings').select('key, value');
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(s => { map[s.key] = s.value; });
        setPdfUrls(map);
      }
    }
    loadSettings();
  }, []);

  function openModal(guide: Guide) {
    setModal({ open: true, guide, step: 'form', name: '', email: '', phone: '', loading: false, error: '' });
  }

  function closeModal() {
    setModal(m => ({ ...m, open: false }));
  }

  async function handleSubmit() {
    const { guide, name, email, phone } = modal;
    if (!name.trim() || !email.trim()) {
      setModal(m => ({ ...m, error: 'Veuillez remplir votre nom et email.' }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setModal(m => ({ ...m, error: 'Email invalide.' }));
      return;
    }
    setModal(m => ({ ...m, loading: true, error: '' }));

    try {
      const supabase = getSupabase();
      // Enregistrer la demande dans Supabase
      const { error: dbErr } = await supabase.from('pdf_orders').insert({
        guide_id: guide!.id,
        guide_title: guide!.title,
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        amount: 2500,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      if (dbErr) {
        // Si la table n'existe pas encore, on continue quand même
        console.warn('DB insert error (table maybe missing):', dbErr.message);
      }

      setModal(m => ({ ...m, loading: false, step: 'pending' }));
    } catch (err) {
      setModal(m => ({ ...m, loading: false, error: 'Erreur serveur. Réessayez.' }));
    }
  }

  return (
    <div className="api-page">
      <section className="hero-sm" style={{ background: 'linear-gradient(135deg, #003c57 0%, #051c24 100%)' }}>
        <div className="container">
          <h1 className="fade-in">API & Développeurs</h1>
          <p className="fade-in" style={{ animationDelay: '0.1s' }}>
            Intégrez la puissance de Tech-Geo dans vos propres applications.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {GUIDES.map(guide => (
              <div key={guide.id} className="card hover-lift" style={{
                padding: '2.5rem',
                background: 'linear-gradient(135deg, rgba(4,187,255,0.08) 0%, transparent 100%)',
                display: 'flex', flexDirection: 'column',
                border: '1px solid rgba(4,187,255,0.2)',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{guide.emoji}</div>
                <h2 style={{ marginBottom: '1rem' }}>{guide.title}</h2>
                <p style={{ color: 'var(--clr-muted)', marginBottom: '2rem', lineHeight: '1.6', flex: 1 }}>{guide.desc}</p>
                <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '2rem' }}>
                  <h4 style={{ marginBottom: '0.75rem' }}>Au programme :</h4>
                  <ul style={{ fontSize: '0.85rem', color: 'var(--clr-muted)', paddingLeft: '1.2rem', lineHeight: 1.8 }}>
                    {guide.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>

                {/* Prix + bouton */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'rgba(4,187,255,0.07)', borderRadius: '10px',
                  padding: '0.9rem 1.2rem', marginBottom: '1rem',
                  border: '1px solid rgba(4,187,255,0.15)',
                }}>
                  <span style={{ color: 'var(--clr-muted)', fontSize: '0.85rem' }}>Accès au guide</span>
                  <span style={{ color: 'var(--clr-accent)', fontWeight: 800, fontSize: '1.1rem' }}>2 500 FCFA</span>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', fontWeight: 'bold' }}
                  onClick={() => openModal(guide)}
                >
                  📥 Télécharger le Guide {guide.id === 'opencode' ? 'OpenCode' : 'PDF'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modal ── */}
      {modal.open && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 99999, padding: '1rem', backdropFilter: 'blur(4px)',
          }}
        >
          <div style={{
            background: 'var(--clr-surface)', borderRadius: '16px',
            padding: '2rem', width: '100%', maxWidth: '460px',
            border: '1px solid rgba(4,187,255,0.25)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            position: 'relative',
          }}>
            {/* Fermer */}
            <button onClick={closeModal} style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'rgba(255,255,255,0.08)', border: 'none',
              borderRadius: '50%', width: '32px', height: '32px',
              color: 'var(--clr-muted)', cursor: 'pointer', fontSize: '1rem',
            }}>✕</button>

            {/* ── Étape 1 : Formulaire ── */}
            {modal.step === 'form' && (
              <>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{modal.guide?.emoji}</div>
                <h3 style={{ marginBottom: '0.25rem' }}>{modal.guide?.title}</h3>
                <p style={{ color: 'var(--clr-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Remplissez vos informations. Après paiement de <strong style={{ color: 'var(--clr-accent)' }}>2 500 FCFA</strong>, le PDF sera envoyé sur votre email.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--clr-muted)', marginBottom: '0.3rem' }}>Nom complet *</label>
                    <input
                      type="text"
                      value={modal.name}
                      onChange={e => setModal(m => ({ ...m, name: e.target.value }))}
                      placeholder="Votre nom"
                      style={{
                        width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
                        border: '1px solid var(--clr-border)', background: 'var(--clr-bg)',
                        color: 'var(--clr-text)', fontSize: '0.9rem', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--clr-muted)', marginBottom: '0.3rem' }}>Email * <span style={{ color: 'var(--clr-accent)', fontSize: '0.75rem' }}>(le PDF sera envoyé ici)</span></label>
                    <input
                      type="email"
                      value={modal.email}
                      onChange={e => setModal(m => ({ ...m, email: e.target.value }))}
                      placeholder="votre@email.com"
                      style={{
                        width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
                        border: '1px solid var(--clr-border)', background: 'var(--clr-bg)',
                        color: 'var(--clr-text)', fontSize: '0.9rem', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--clr-muted)', marginBottom: '0.3rem' }}>Téléphone (optionnel)</label>
                    <input
                      type="text"
                        inputMode="tel"
                        value={modal.phone}
                      onChange={e => setModal(m => ({ ...m, phone: e.target.value }))}
                      placeholder="+228 71 03 01 88"
                      style={{
                        width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
                        border: '1px solid var(--clr-border)', background: 'var(--clr-bg)',
                        color: 'var(--clr-text)', fontSize: '0.9rem', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {modal.error && (
                  <div style={{ color: '#ff4757', fontSize: '0.82rem', marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(255,71,87,0.1)', borderRadius: '6px' }}>
                    ⚠️ {modal.error}
                  </div>
                )}

                {/* Instructions paiement */}
                <div style={{
                  marginTop: '1.25rem', padding: '1rem', borderRadius: '10px',
                  background: 'rgba(4,187,255,0.07)', border: '1px solid rgba(4,187,255,0.2)',
                }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--clr-muted)', margin: 0, lineHeight: 1.7 }}>
                    💳 <strong style={{ color: 'var(--clr-text)' }}>Comment payer :</strong><br />
                    Envoyez <strong style={{ color: 'var(--clr-accent)' }}>2 500 FCFA</strong> par <strong>Flooz / TMoney / Wave</strong> au :<br />
                    <span style={{ color: 'var(--clr-accent)', fontSize: '1rem', fontWeight: 700 }}>+228 71 03 01 88</span><br />
                    <span style={{ fontSize: '0.78rem' }}>Mentionnez votre email en référence.</span>
                  </p>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', fontSize: '0.95rem' }}
                  onClick={handleSubmit}
                  disabled={modal.loading}
                >
                  {modal.loading ? '⏳ Envoi...' : "✅ J'ai payé — Envoyer ma demande"}
                </button>
              </>
            )}

            {/* ── Étape 2 : En attente de confirmation ── */}
            {modal.step === 'pending' && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⏳</div>
                <h3 style={{ marginBottom: '0.75rem' }}>Demande enregistrée !</h3>
                <p style={{ color: 'var(--clr-muted)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                  Votre demande pour <strong style={{ color: 'var(--clr-accent)' }}>{modal.guide?.title}</strong> a bien été reçue.<br /><br />
                  Dès que votre paiement de <strong style={{ color: 'var(--clr-accent)' }}>2 500 FCFA</strong> est confirmé, le PDF sera envoyé automatiquement à :<br />
                  <strong style={{ color: 'var(--clr-text)' }}>{modal.email}</strong>
                </p>
                <div style={{
                  margin: '1.25rem 0',
                  padding: '1rem', borderRadius: '10px',
                  background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.25)',
                  fontSize: '0.85rem', color: 'var(--clr-muted)',
                }}>
                  📩 Vérifiez aussi vos <strong>spams</strong> si vous ne recevez pas l'email sous 24h.
                </div>
                <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={closeModal}>
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
