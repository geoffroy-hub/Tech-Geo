'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ShareButtons from '@/components/ShareButtons';
import { TUTORIALS, TUTORIAL_CONTENT } from '../data';

import type { Metadata } from 'next';
import { TUTORIALS, TUTORIAL_CONTENT } from '../data';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tutorial = TUTORIALS.find(t => t.slug === slug);
  if (!tutorial) return {};
  return {
    title: `${tutorial.title} | Tech-Geo Tutoriels`,
    description: tutorial.description,
    openGraph: {
      title: tutorial.title,
      description: tutorial.description,
      images: [{ url: `https://tech-geo.vercel.app${tutorial.image}`, width: 1200, height: 630 }],
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: tutorial.title, description: tutorial.description },
  };
}

export default function TutorialDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const tutorial = TUTORIALS.find(t => t.slug === slug);
  const content = TUTORIAL_CONTENT[slug];

  if (!tutorial || !content) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '3rem' }}>🔍</div>
        <h2>Tutoriel introuvable</h2>
        <Link href="/tutorials" className="btn btn-primary">← Retour aux tutoriels</Link>
      </div>
    );
  }

  const currentIndex = TUTORIALS.findIndex(t => t.slug === slug);
  const prev = TUTORIALS[currentIndex - 1] ?? null;
  const next = TUTORIALS[currentIndex + 1] ?? null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": tutorial.title,
    "description": tutorial.description,
    "image": `https://tech-geo.vercel.app${tutorial.image}`,
    "url": `https://tech-geo.vercel.app/tutorials/${tutorial.slug}`,
    "inLanguage": "fr-FR",
    "author": { "@type": "Organization", "name": "Tech-Geo" },
    "publisher": {
      "@type": "Organization",
      "name": "Tech-Geo",
      "logo": { "@type": "ImageObject", "url": "https://tech-geo.vercel.app/images/Logo/logo.webp" }
    },
    "datePublished": "2026-01-01",
    "dateModified": "2026-05-16",
    "keywords": tutorial.tags?.join(', ') ?? tutorial.category,
    "articleSection": tutorial.category
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero banner */}
      <div style={{ position: 'relative', height: '320px', overflow: 'hidden' }}>
        <img
          src={tutorial.image}
          alt={tutorial.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4)' }}
         loading="lazy" decoding="async"/>
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(5,28,36,0.95) 0%, transparent 60%)',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'flex-end', padding: '2.5rem',
          }}
        >
          <button
            onClick={() => router.back()}
            style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', backdropFilter: 'blur(6px)' }}
          >
            ← Retour
          </button>
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'var(--clr-accent)', color: '#000', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '20px', textTransform: 'uppercase' }}>
              {tutorial.category}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.72rem', padding: '0.25rem 0.75rem', borderRadius: '20px', backdropFilter: 'blur(6px)' }}>
              ⏱ {tutorial.duration}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.72rem', padding: '0.25rem 0.75rem', borderRadius: '20px', backdropFilter: 'blur(6px)' }}>
              {tutorial.level}
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: '2rem', lineHeight: 1.2, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            {tutorial.title}
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '1rem' }}>{tutorial.description}</p>
          <div style={{ marginTop: '1rem' }}>
            <ShareButtons title={tutorial.title} description={tutorial.description} url={`https://tech-geo.vercel.app/tutorials/${tutorial.slug}`} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2.5rem', maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        
        {/* Main content */}
        <article>
          {content.sections.map((section, i) => (
            <div key={section.id} style={{ marginBottom: '2.5rem' }}>
              <h2
                id={section.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  fontSize: '1.25rem', marginBottom: '1rem',
                  paddingBottom: '0.5rem', borderBottom: '2px solid var(--clr-teal)',
                }}
              >
                <span
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'var(--clr-accent)', color: '#000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 800, flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                {section.title}
              </h2>
              <div style={{ color: 'var(--clr-muted)', lineHeight: 1.8, fontSize: '0.97rem' }}>
                {section.content}
              </div>
              {section.code && (
                <pre
                  style={{
                    background: 'rgba(0,0,0,0.4)', border: '1px solid var(--clr-teal)',
                    borderRadius: '8px', padding: '1.25rem', marginTop: '1rem',
                    overflowX: 'auto', fontSize: '0.85rem', lineHeight: 1.6,
                    color: 'var(--clr-accent)',
                  }}
                >
                  <code>{section.code}</code>
                </pre>
              )}
            </div>
          ))}

          {/* Prev / Next */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--clr-border)' }}>
            {prev ? (
              <Link href={`/tutorials/${prev.slug}`} className="card" style={{ padding: '1rem 1.25rem', textDecoration: 'none', display: 'block' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-muted)', marginBottom: '0.3rem' }}>← Précédent</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--clr-accent)' }}>{prev.title}</div>
              </Link>
            ) : <div />}
            {next ? (
              <Link href={`/tutorials/${next.slug}`} className="card" style={{ padding: '1rem 1.25rem', textDecoration: 'none', display: 'block', textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-muted)', marginBottom: '0.3rem' }}>Suivant →</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--clr-accent)' }}>{next.title}</div>
              </Link>
            ) : <div />}
          </div>
        </article>

        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Table of contents */}
          <div className="card" style={{ padding: '1.25rem', position: 'sticky', top: '80px' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📋 Sommaire
            </h4>
            <ol style={{ margin: 0, padding: '0 0 0 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {content.sections.map(section => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    style={{ color: 'var(--clr-muted)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--clr-accent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--clr-muted)')}
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>

          {/* Info card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ℹ️ Infos
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--clr-muted)' }}>Durée</span>
                <span style={{ fontWeight: 600 }}>{tutorial.duration}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--clr-muted)' }}>Niveau</span>
                <span style={{ fontWeight: 600 }}>{tutorial.level}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--clr-muted)' }}>Catégorie</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{tutorial.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--clr-muted)' }}>Auteur</span>
                <span style={{ fontWeight: 600 }}>Tech-Geo</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center', border: '1px solid var(--clr-teal)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🌐</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--clr-muted)', margin: '0 0 0.75rem' }}>
              Besoin d'un site web professionnel ?
            </p>
            <Link href="/site" className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem' }}>
              À partir de 12 000 FCFA
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
