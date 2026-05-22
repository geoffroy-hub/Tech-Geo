'use client';

interface Stats {
  products: number; orders: number; revenue: number;
  messages: number; tutorials: number; users: number;
}

export default function DashboardPanel({ stats }: { stats: Stats }) {
  const cards = [
    { icon: '📦', value: stats.products, label: 'Produits', color: '#04bbff' },
    { icon: '🛒', value: stats.orders, label: 'Commandes', color: '#8bc34a' },
    { icon: '💰', value: stats.revenue.toLocaleString('fr-FR'), label: 'Revenus (FCFA)', color: '#f0c040' },
    { icon: '✉️', value: stats.messages, label: 'Messages', color: '#ff7043' },
    { icon: '📚', value: stats.tutorials, label: 'Tutoriels', color: '#ab47bc' },
    { icon: '👥', value: stats.users, label: 'Utilisateurs', color: '#26c6da' },
  ];

  const avgOrderValue = stats.orders > 0
    ? Math.round(stats.revenue / stats.orders).toLocaleString('fr-FR')
    : '—';

  const conversionRate = stats.users > 0
    ? ((stats.orders / stats.users) * 100).toFixed(1)
    : '—';

  return (
    <div className="admin-panel active">
      {/* Stat cards */}
      <div className="admin-stats" style={{ marginBottom: '2rem' }}>
        {cards.map(c => (
          <div key={c.label} className="stat-card card" style={{ borderLeft: `3px solid ${c.color}` }}>
            <div className="stat-card-icon" style={{ color: c.color }}>{c.icon}</div>
            <div>
              <div className="stat-card-value" style={{ color: c.color }}>{c.value}</div>
              <div className="stat-card-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* KPIs secondaires */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(4,187,255,0.06)', border: '1px solid rgba(4,187,255,0.2)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--clr-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
            Panier moyen
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--clr-accent)' }}>{avgOrderValue} F</div>
        </div>
        <div style={{ background: 'rgba(139,195,74,0.06)', border: '1px solid rgba(139,195,74,0.2)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--clr-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
            Taux de conversion
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8bc34a' }}>{conversionRate}%</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--clr-muted)' }}>commandes / utilisateurs</div>
        </div>
        <div style={{ background: 'rgba(171,71,188,0.06)', border: '1px solid rgba(171,71,188,0.2)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--clr-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
            Contenu total
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ab47bc' }}>{stats.products + stats.tutorials}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--clr-muted)' }}>produits + tutoriels publiés</div>
        </div>
      </div>

      {/* Liens raccourcis vers les panneaux */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--clr-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
          ⚡ Accès rapide
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { href: '/boutique', label: '🛍 Voir la boutique', target: '_blank' },
            { href: '/admin', label: '📦 Gérer les produits' },
            { href: '/admin', label: '🛒 Voir les commandes' },
            { href: '/admin', label: '📚 Tutoriels' },
          ].map((link, i) => (
            <a key={i} href={link.href} target={link.target}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem',
                background: 'rgba(4,187,255,0.08)', border: '1px solid rgba(4,187,255,0.2)',
                color: 'var(--clr-accent)', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(4,187,255,0.15)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(4,187,255,0.08)'}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
