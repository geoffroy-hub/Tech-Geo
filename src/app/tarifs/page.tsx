import Link from 'next/link';

export const metadata = {
  title: 'Tarifs | Tech-Geo',
  description: 'Découvrez nos forfaits de création de sites web, logiciels et services numériques. Prix clairs, sans surprise.',
};

const webPlans = [
  {
    id: 'anniversaire',
    name: 'Anniversaire',
    price: 3500,
    icon: '🎂',
    badge: '🎉 OFFRE SPÉCIALE',
    badgeColor: '#e91e8c',
    highlight: false,
    description: 'Un site cadeau unique pour célébrer un anniversaire inoubliable.',
    features: ['Page unique dédiée', 'Galerie photos personnalisée', 'Message & compte à rebours', 'Design festif sur mesure', 'Nom de domaine GRATUIT', 'Hébergement 1 an GRATUIT', 'Livraison en 48h'],
  },
  {
    id: 'couple',
    name: 'Couple',
    price: 4000,
    icon: '💑',
    badge: '💍 PERSONNALISABLE',
    badgeColor: '#e74c3c',
    highlight: true,
    description: 'Site romantique pour mariage, fiançailles ou Saint-Valentin.',
    features: ['Page couple personnalisable', 'Galerie photos & vidéos', 'Histoire / Timeline', 'Compte à rebours', 'Design romantique', 'Domaine + Hébergement GRATUIT', 'Livraison en 48h'],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 12000,
    icon: '🚀',
    badge: null,
    badgeColor: null,
    highlight: false,
    description: 'Idéal pour une présence en ligne simple et professionnelle.',
    features: ['1 à 3 pages', 'Design responsive', 'Formulaire de contact', 'Hébergement 1 an inclus', 'Domaine .tg ou .com', 'Livraison en 5 jours'],
  },
  {
    id: 'business',
    name: 'Business',
    price: 35000,
    icon: '💼',
    badge: '⭐ POPULAIRE',
    badgeColor: null,
    highlight: false,
    description: 'Pour les PME et artisans qui veulent se démarquer.',
    features: ['5 à 8 pages personnalisées', 'Design sur mesure', 'Blog / Actualités', 'Galerie photos & vidéos', 'SEO de base', 'Hébergement 1 an', 'Livraison en 10 jours'],
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    price: 75000,
    icon: '🛒',
    badge: null,
    badgeColor: null,
    highlight: false,
    description: 'Boutique en ligne complète pour vendre vos produits.',
    features: ['Pages illimitées', 'Catalogue produits', 'Panier & paiement', 'Gestion des stocks', 'Dashboard admin', 'SEO avancé + Analytics', 'Support 3 mois', 'Livraison en 21 jours'],
  },
];

const extras = [
  { icon: '🎨', label: 'Logo professionnel', price: 5000 },
  { icon: '🔧', label: 'Maintenance mensuelle', price: 8000 },
  { icon: '🛒', label: 'Boutique en ligne (+)', price: 20000 },
  { icon: '🌍', label: 'Multilangue (FR/EN)', price: 10000 },
  { icon: '🤖', label: 'Chatbot intégré', price: 15000 },
  { icon: '📱', label: 'Application mobile (PWA)', price: 25000 },
];

const apiPlans = [
  { name: 'Découverte', price: 0, icon: '🆓', calls: '100 appels/mois', features: ['Accès API de base', 'Documentation complète', 'Support communautaire'] },
  { name: 'Starter', price: 5000, icon: '⚡', calls: '5 000 appels/mois', features: ['Accès toutes les routes', 'Support par email', 'SLA 99%'] },
  { name: 'Pro', price: 15000, icon: '🚀', calls: '50 000 appels/mois', features: ['Priorité sur les serveurs', 'Support prioritaire 24h', 'SLA 99.9%', 'Webhook & webhooks'] },
];

export default function TarifsPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-sm">
        <div className="container">
          <h1>Nos Tarifs</h1>
          <p>Des prix clairs et transparents, adaptés à tous les budgets en Afrique.</p>
        </div>
      </section>

      {/* Sites Web */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">🌐 Création de Sites Web</h2>
          <p style={{ textAlign: 'center', color: 'var(--clr-muted)', marginTop: '-1rem', marginBottom: '2.5rem' }}>
            Paiement Mobile Money · Livraison partout en Afrique
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {webPlans.map(plan => (
              <div
                key={plan.id}
                className="card"
                style={{
                  border: plan.highlight ? '2px solid var(--clr-accent)' : '1px solid var(--clr-teal)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                    background: plan.badgeColor ?? 'var(--clr-accent)',
                    color: '#fff', fontSize: '0.72rem', fontWeight: 700,
                    padding: '3px 12px', borderRadius: '20px', whiteSpace: 'nowrap',
                  }}>{plan.badge}</div>
                )}
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{plan.icon}</div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem' }}>{plan.name}</h3>
                <p style={{ color: 'var(--clr-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>{plan.description}</p>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--clr-accent)', marginBottom: '1rem' }}>
                  {plan.price.toLocaleString('fr-FR')} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>FCFA</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', flex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ padding: '0.3rem 0', fontSize: '0.88rem', color: 'var(--clr-muted)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--clr-accent)', flexShrink: 0 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/site" className={`btn ${plan.highlight ? 'btn-primary' : 'btn-outline'}`} style={{ textAlign: 'center' }}>
                  Commander
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Options supplémentaires */}
      <section className="section" style={{ background: 'rgba(0,60,87,0.15)' }}>
        <div className="container">
          <h2 className="section-title">➕ Options Supplémentaires</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            {extras.map(e => (
              <div key={e.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.8rem' }}>{e.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{e.label}</div>
                  <div style={{ color: 'var(--clr-accent)', fontWeight: 700 }}>{e.price.toLocaleString('fr-FR')} FCFA</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">⚡ Accès API</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            {apiPlans.map(plan => (
              <div key={plan.name} className="card" style={{ border: plan.name === 'Pro' ? '2px solid var(--clr-accent)' : undefined }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{plan.icon}</div>
                <h3 style={{ margin: '0 0 0.25rem' }}>{plan.name}</h3>
                <div style={{ color: 'var(--clr-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{plan.calls}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: plan.price === 0 ? 'var(--clr-teal)' : 'var(--clr-accent)', marginBottom: '1rem' }}>
                  {plan.price === 0 ? 'Gratuit' : `${plan.price.toLocaleString('fr-FR')} FCFA/mois`}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ padding: '0.3rem 0', fontSize: '0.88rem', color: 'var(--clr-muted)', display: 'flex', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--clr-accent)' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/api" className="btn btn-outline" style={{ textAlign: 'center', display: 'block' }}>Commencer</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ rapide */}
      <section className="section" style={{ background: 'rgba(5,28,36,0.4)' }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <h2 className="section-title">Questions fréquentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
            {[
              { q: 'Depuis quel pays peut-on commander ?', a: 'Depuis n\'importe quel pays africain. Nous acceptons le Mobile Money (Wave, MTN MoMo, Orange Money, Moov, T-Money…) et le virement bancaire.' },
              { q: 'Y a-t-il des frais cachés ?', a: 'Non. Le prix affiché est le prix final. Les options supplémentaires sont clairement listées et optionnelles.' },
              { q: 'Quel est le délai de livraison ?', a: 'De 48h pour les sites événementiels à 21 jours pour les e-commerces. Le délai exact est indiqué sur chaque forfait.' },
              { q: 'Puis-je modifier mon site après livraison ?', a: 'Oui. Une maintenance mensuelle est disponible à partir de 8 000 FCFA/mois.' },
            ].map(item => (
              <div key={item.q} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--clr-accent)' }}>❓ {item.q}</div>
                <div style={{ color: 'var(--clr-muted)', fontSize: '0.9rem' }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-section animate-on-scroll hover-lift">
            <h2>Un projet en tête ?</h2>
            <p>Contactez-nous pour un devis personnalisé gratuit. Nous répondons en moins de 24h.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/site" className="btn btn-primary ripple">Commander un site</Link>
              <Link href="/contact" className="btn btn-outline ripple">Nous contacter</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
