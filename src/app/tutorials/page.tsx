'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TUTORIALS } from './data';

const CATEGORIES = ['Tous', 'électronique', 'informatique', 'robotique'];

const LEVEL_COLOR: Record<string, string> = {
  'Débutant': '#27ae60',
  'Intermédiaire': '#f39c12',
  'Avancé': '#e74c3c',
};

export default function TutorialsPage() {
  const [filter, setFilter] = useState('Tous');
  const [search, setSearch] = useState('');

  const filtered = TUTORIALS.filter(t => {
    const matchCat = filter === 'Tous' || t.category === filter;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      {/* Hero */}
      <section
        className="hero-sm"
        style={{ backgroundImage: 'url(/images/tutorial-photos/top-view-wires-tech-background.webp)' }}
      >
        <div className="container">
          <h1>Tutoriels</h1>
          <p>Des guides pratiques pour maîtriser l&apos;électronique et l&apos;informatique, étape par étape.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">

          {/* Search + filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="🔍 Rechercher un tutoriel…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', maxWidth: '480px',
                padding: '0.75rem 1.25rem',
                borderRadius: '30px',
                border: '1px solid var(--clr-teal)',
                background: 'var(--clr-surface)',
                color: 'var(--clr-text)',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`btn ${filter === cat ? 'btn-primary' : 'btn-outline'} btn-sm`}
                  style={{ borderRadius: '20px', textTransform: 'capitalize' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <p style={{ color: 'var(--clr-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            {filtered.length} tutoriel{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          </p>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--clr-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <p>Aucun tutoriel ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {filtered.map(tutorial => (
                <Link
                  key={tutorial.id}
                  href={`/tutorials/${tutorial.slug}`}
                  className="card hover-lift"
                  style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer' }}
                >
                  {/* Thumbnail */}
                  <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                    <img
                      src={tutorial.image}
                      alt={tutorial.title}
                      loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                    {/* Overlay gradient */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,28,36,0.7) 0%, transparent 50%)' }} />

                    {/* Duration badge */}
                    <span
                      style={{
                        position: 'absolute', bottom: '0.6rem', right: '0.6rem',
                        background: 'rgba(0,0,0,0.75)', color: 'var(--clr-accent)',
                        fontSize: '0.75rem', fontWeight: 700,
                        padding: '0.2rem 0.6rem', borderRadius: '20px',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      ⏱ {tutorial.duration}
                    </span>

                    {/* Level badge */}
                    <span
                      style={{
                        position: 'absolute', top: '0.6rem', left: '0.6rem',
                        background: LEVEL_COLOR[tutorial.level] + 'cc',
                        color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                        padding: '0.2rem 0.6rem', borderRadius: '20px',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {tutorial.level}
                    </span>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '1.1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <span
                      style={{
                        fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.06em', color: 'var(--clr-accent)',
                      }}
                    >
                      {tutorial.category}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1rem', lineHeight: 1.35 }}>{tutorial.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--clr-muted)', lineHeight: 1.5, flex: 1 }}>
                      {tutorial.description}
                    </p>
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        marginTop: '0.6rem', paddingTop: '0.6rem',
                        borderTop: '1px solid var(--clr-border)',
                      }}
                    >
                      <div
                        style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: 'var(--clr-accent)', color: '#000',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 800, flexShrink: 0,
                        }}
                      >
                        T
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--clr-muted)' }}>Tech-Geo</span>
                      <span
                        style={{
                          marginLeft: 'auto', fontSize: '0.8rem',
                          color: 'var(--clr-accent)', fontWeight: 600,
                        }}
                      >
                        Lire →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
