'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import NewsletterForm from '@/components/NewsletterForm';
import { checkRateLimit } from '@/lib/rateLimit';
import PhoneInput from '@/components/PhoneInput';

const plans = [
  {
    id: 'anniversaire',
    name: 'Anniversaire',
    price: 3500,
    icon: '🎂',
    badge: '🎉 OFFRE SPÉCIALE',
    badgeColor: '#e91e8c',
    description: 'Un site cadeau unique pour célébrer un anniversaire inoubliable.',
    features: [
      'Page unique dédiée à l\'événement',
      'Galerie photos personnalisée',
      'Message & compte à rebours',
      'Design festif sur mesure',
      'Nom de domaine GRATUIT',
      'Hébergement 1 an GRATUIT',
      'Livraison en 48h',
    ],
    highlight: false,
  },
  {
    id: 'couple',
    name: 'Couple',
    price: 4000,
    icon: '💑',
    badge: '💍 PERSONNALISABLE',
    badgeColor: '#e74c3c',
    description: 'Site romantique pour mariage, fiançailles ou Saint-Valentin.',
    features: [
      'Page couple entièrement personnalisable',
      'Galerie photos & vidéos',
      'Histoire d\'amour / Timeline',
      'Compte à rebours du grand jour',
      'Design romantique sur mesure',
      'Nom de domaine GRATUIT',
      'Hébergement 1 an GRATUIT',
      'Livraison en 48h',
    ],
    highlight: true,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 12000,
    icon: '🚀',
    badge: null,
    badgeColor: null,
    description: 'Idéal pour une présence en ligne simple et professionnelle.',
    features: [
      '1 à 3 pages (Accueil, À propos, Contact)',
      'Design moderne & responsive',
      'Formulaire de contact',
      'Hébergement 1 an inclus',
      'Nom de domaine .tg ou .com',
      'Livraison en 5 jours',
    ],
    highlight: false,
  },
  {
    id: 'business',
    name: 'Business',
    price: 35000,
    icon: '💼',
    badge: '⭐ POPULAIRE',
    badgeColor: null,
    description: 'Pour les PME et artisans qui veulent se démarquer.',
    features: [
      '5 à 8 pages personnalisées',
      'Design sur mesure avec votre charte',
      'Blog / Actualités',
      'Galerie photos & vidéos',
      'Optimisation SEO de base',
      'Hébergement 1 an inclus',
      'Livraison en 10 jours',
    ],
    highlight: false,
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    price: 75000,
    icon: '🛒',
    badge: null,
    badgeColor: null,
    description: 'Boutique en ligne complète pour vendre vos produits.',
    features: [
      'Pages illimitées',
      'Catalogue produits complet',
      'Panier & paiement en ligne',
      'Gestion des stocks',
      'Tableau de bord admin',
      'SEO avancé + Analytics',
      'Hébergement 1 an inclus',
      'Support 3 mois inclus',
      'Livraison en 21 jours',
    ],
    highlight: false,
  },
];

const extras = [
  { label: 'Logo professionnel', price: 5000 },
  { label: 'Maintenance mensuelle', price: 8000 },
  { label: 'Boutique en ligne (+)', price: 20000 },
  { label: 'Multilangue (FR/EN)', price: 10000 },
  { label: 'Chatbot intégré', price: 15000 },
];

export default function SitePage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    activity: '',
    plan: '',
    details: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setForm((f) => ({ ...f, plan: planId }));
    setTimeout(() => {
      document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('contact_messages').insert([
        {
          name: form.name,
          email: form.email,
          message: `📌 COMMANDE SITE WEB\nPlan: ${form.plan}\nTéléphone: ${form.phone}\nActivité: ${form.activity}\nDétails: ${form.details}`,
        },
      ]);
      if (error) throw error;
      setStatus('success');
      setForm({ name: '', email: '', phone: '', activity: '', plan: '', details: '' });
      setSelectedPlan(null);
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      {/* Hero */}
      <section
        className="hero-sm"
        style={{ backgroundImage: 'url(/images/tutorial-photos/motherboard-background.webp)' }}
      >
        <div className="container">
          <h1>Création de Site Web</h1>
          <p>
            Tech‑Geo conçoit votre site professionnel sur mesure.{' '}
            <strong style={{ color: 'var(--clr-accent)' }}>À partir de 3 500 FCFA.</strong>
          </p>
        </div>
      </section>

      {/* Why us */}
      <section className="section" style={{ paddingBottom: '1rem' }}>
        <div className="container">
          <h2 className="section-title">Pourquoi nous confier votre site ?</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {[
              { icon: '⚡', title: 'Rapide', desc: 'Livraison express dès 5 jours ouvrés' },
              { icon: '🎨', title: 'Sur mesure', desc: 'Design adapté à votre activité' },
              { icon: '📱', title: 'Responsive', desc: 'Parfait sur mobile, tablette et PC' },
              { icon: '🔒', title: 'Sécurisé', desc: 'SSL, sauvegardes et hébergement inclus' },
              { icon: '🌍', title: 'SEO', desc: 'Optimisé pour Google dès le départ' },
              { icon: '🤝', title: 'Support', desc: 'Accompagnement après livraison' },
            ].map((item) => (
              <div
                key={item.title}
                className="card feature-card"
                style={{ textAlign: 'center', padding: '1.25rem 1rem' }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <h3 style={{ margin: '0 0 0.3rem', fontSize: '1rem' }}>{item.title}</h3>
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--clr-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Nos forfaits</h2>
          <p style={{ textAlign: 'center', color: 'var(--clr-muted)', marginBottom: '2rem' }}>
            Choisissez le forfait qui vous convient. Prix min :{' '}
            <strong style={{ color: 'var(--clr-accent)' }}>3 500 FCFA</strong>.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
              alignItems: 'start',
            }}
          >
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="card"
                style={{
                  padding: '2rem 1.5rem',
                  border: plan.highlight
                    ? '2px solid var(--clr-accent)'
                    : selectedPlan === plan.id
                    ? '2px solid var(--clr-teal)'
                    : '1px solid var(--clr-border)',
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                {plan.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-14px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: plan.badgeColor ?? 'var(--clr-accent)',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.25rem 1rem',
                      borderRadius: '20px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {plan.badge}
                  </div>
                )}
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{plan.icon}</div>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem' }}>{plan.name}</h3>
                  <div
                    style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--clr-accent)', lineHeight: 1 }}
                  >
                    {plan.price.toLocaleString('fr-FR')}
                    <span style={{ fontSize: '1rem', fontWeight: 400 }}> FCFA</span>
                  </div>
                  <p style={{ color: 'var(--clr-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    {plan.description}
                  </p>
                </div>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}
                    >
                      <span style={{ color: 'var(--clr-accent)', flexShrink: 0, marginTop: '1px' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`btn ${selectedPlan === plan.id ? 'btn-primary' : plan.highlight ? 'btn-primary' : 'btn-outline'}`}
                  style={{ width: '100%' }}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {selectedPlan === plan.id ? '✓ Sélectionné' : 'Choisir ce forfait'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Extras */}
      <section className="section" style={{ paddingTop: '0.5rem' }}>
        <div className="container">
          <h2 className="section-title">Options supplémentaires</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            {extras.map((ex) => (
              <div
                key={ex.label}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.9rem 1.25rem',
                }}
              >
                <span style={{ fontSize: '0.9rem' }}>{ex.label}</span>
                <span style={{ fontWeight: 700, color: 'var(--clr-accent)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                  + {ex.price.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order form */}
      <section className="section" id="order-form">
        <div className="container" style={{ maxWidth: '680px' }}>
          <h2 className="section-title">Commander votre site</h2>
          <p style={{ textAlign: 'center', color: 'var(--clr-muted)', marginBottom: '2rem' }}>
            Remplissez ce formulaire et nous vous recontactons sous 24h pour démarrer votre projet.
          </p>
          <div className="card" style={{ padding: '2rem', overflow: 'visible' }}>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>Nom complet *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <PhoneInput
                    value={form.phone}
                    onChange={(val) => setForm({ ...form, phone: val })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Votre activité / secteur *</label>
                <input
                  type="text"
                  value={form.activity}
                  onChange={(e) => setForm({ ...form, activity: e.target.value })}
                  placeholder="Ex : Restaurant, Boutique, ONG, Salon de coiffure…"
                  required
                />
              </div>
              <div className="form-group" style={{ position: 'relative', zIndex: 100 }}>
                <label>Forfait souhaité *</label>
                <div
                  style={{ position: 'relative', userSelect: 'none' }}
                  ref={(el) => {
                    if (!el) return;
                    // Close dropdown on outside click
                    const handler = (e: MouseEvent) => {
                      const dd = el.querySelector('[data-dropdown]') as HTMLElement;
                      const target = e.target as Node;
                      if (!el.contains(target) && dd && !dd.contains(target)) {
                        dd.style.display = 'none';
                        const arrow = el.querySelector('[data-arrow]') as HTMLElement;
                        if (arrow) arrow.style.transform = 'translateY(-50%) rotate(0deg)';
                      }
                    };
                    document.addEventListener('mousedown', handler);
                  }}
                >
                  {/* Hidden input for form validation */}
                  <input type="text" required value={form.plan} onChange={() => {}} style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }} />
                  {/* Trigger button */}
                  <div
                    onClick={(e) => {
                      const trigger = e.currentTarget as HTMLElement;
                      const dd = (trigger.parentElement!.querySelector('[data-dropdown]') as HTMLElement);
                      const arrow = (trigger.querySelector('[data-arrow]') as HTMLElement);
                      const isOpen = dd.style.display === 'block';
                      if (!isOpen) {
                        const rect = trigger.getBoundingClientRect();
                        dd.style.position = 'fixed';
                        dd.style.top = (rect.bottom + 4) + 'px';
                        dd.style.left = rect.left + 'px';
                        dd.style.width = rect.width + 'px';
                        dd.style.right = 'auto';
                      }
                      dd.style.display = isOpen ? 'none' : 'block';
                      arrow.style.transform = isOpen ? 'translateY(-50%) rotate(0deg)' : 'translateY(-50%) rotate(180deg)';
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.5rem 0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--clr-border)',
                      background: 'var(--clr-surface)',
                      color: form.plan ? 'var(--clr-text)' : 'var(--clr-muted)',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      position: 'relative',
                    }}
                  >
                    {form.plan
                      ? (() => { const p = plans.find(x => x.id === form.plan); return p ? `${p.icon} ${p.name} — ${p.price.toLocaleString('fr-FR')} FCFA` : '-- Choisissez un forfait --'; })()
                      : '-- Choisissez un forfait --'}
                    <span data-arrow style={{
                      position: 'absolute', right: '0.9rem', top: '50%',
                      transform: 'translateY(-50%)',
                      transition: 'transform 0.2s',
                      fontSize: '0.75rem',
                      color: 'var(--clr-muted)',
                      pointerEvents: 'none',
                    }}>▼</span>
                  </div>
                  {/* Dropdown list */}
                  <div data-dropdown style={{
                    display: 'none',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 'auto',
                    background: 'var(--clr-surface)',
                    border: '1px solid var(--clr-border)',
                    borderRadius: '8px',
                    zIndex: 99999,
                    overflow: 'hidden',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.40)',
                  }}>
                    {plans.map((p, i) => (
                      <div
                        key={p.id}
                        onClick={(e) => {
                          setForm({ ...form, plan: p.id });
                          setSelectedPlan(p.id);
                          const dd = (e.currentTarget.parentElement as HTMLElement);
                          dd.style.display = 'none';
                          const arrow = dd.previousElementSibling?.querySelector('[data-arrow]') as HTMLElement;
                          if (arrow) arrow.style.transform = 'translateY(-50%) rotate(0deg)';
                        }}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          color: 'var(--clr-text)',
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          borderTop: i > 0 ? '1px solid var(--clr-border)' : 'none',
                          background: form.plan === p.id ? 'rgba(4,187,255,0.12)' : 'transparent',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (form.plan !== p.id) (e.currentTarget as HTMLElement).style.background = 'rgba(4,187,255,0.06)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = form.plan === p.id ? 'rgba(4,187,255,0.12)' : 'transparent'; }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{p.icon}</span>
                          <span style={{ fontWeight: form.plan === p.id ? 600 : 400, color: 'var(--clr-text)' }}>{p.name}</span>
                        </span>
                        <span style={{
                          color: '#04bbff',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          fontSize: '0.92rem',
                          background: 'rgba(4,187,255,0.1)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px solid rgba(4,187,255,0.25)',
                        }}>
                          {p.price.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Détails supplémentaires</label>
                <textarea
                  rows={4}
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  placeholder="Décrivez votre projet, vos couleurs, des sites de référence, options souhaitées…"
                ></textarea>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={status === 'loading'}
                style={{ width: '100%', fontSize: '1rem', padding: '0.85rem' }}
              >
                {status === 'loading' ? '⏳ Envoi en cours…' : '📩 Envoyer ma commande'}
              </button>
              {status === 'success' && (
                <div className="form-success show" style={{ marginTop: '1rem' }}>
                  ✅ Commande envoyée ! Nous vous contacterons dans les 24h.
                </div>
              )}
              {status === 'error' && (
                <div className="auth-error show" style={{ marginTop: '1rem' }}>
                  ❌ Une erreur est survenue. Réessayez ou contactez-nous directement.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ paddingTop: '0.5rem' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <h2 className="section-title">Questions fréquentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              {
                q: 'Quel est le délai de livraison ?',
                a: 'Le délai varie selon le forfait : 5 jours pour Starter, 10 jours pour Business et 21 jours pour E-commerce.',
              },
              {
                q: 'Comment se passe le paiement ?',
                a: 'Un acompte de 50% est demandé au démarrage, le solde à la livraison. Nous acceptons Mobile Money (Flooz, T-Money) et virement bancaire.',
              },
              {
                q: 'Et après la livraison ?',
                a: "Vous recevez les accès complets à votre site. Une formation basique est incluse. Des contrats de maintenance mensuelle sont disponibles à partir de 8 000 FCFA/mois.",
              },
              {
                q: 'Mon site sera-t-il visible sur Google ?',
                a: 'Oui, tous nos sites intègrent les bases du référencement naturel (SEO). Des options avancées sont disponibles en supplément.',
              },
            ].map((faq) => (
              <div key={faq.q} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', color: 'var(--clr-accent)' }}>{faq.q}</h4>
                <p style={{ margin: 0, color: 'var(--clr-muted)', fontSize: '0.9rem' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section" style={{ borderTop: '1px solid var(--clr-teal)' }}>
        <div className="container text-center">
          <h2>Restez informé</h2>
          <p className="mb-4">
            Recevez nos offres spéciales et conseils web directement dans votre boîte mail.
          </p>
          <NewsletterForm buttonText="S'abonner" />
        </div>
      </section>
    </>
  );
}
