'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  description?: string;
  url?: string;
}

export default function ShareButtons({ title, description = '', url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const pageUrl = url
    ? url
    : typeof window !== 'undefined'
    ? window.location.href
    : '';

  const encodedUrl   = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc  = encodeURIComponent(description.slice(0, 120));

  const links = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20-%20${encodedDesc}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter:  `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=TechGeoTogo`,
  };

  function openShare(href: string) {
    window.open(href, '_blank', 'width=600,height=500,noopener,noreferrer');
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--clr-muted)', marginRight: '0.25rem' }}>
        Partager :
      </span>

      {/* WhatsApp */}
      <button
        onClick={() => openShare(links.whatsapp)}
        title="Partager sur WhatsApp"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: '#25D366', color: '#fff',
          border: 'none', borderRadius: '20px',
          padding: '0.35rem 0.85rem', cursor: 'pointer',
          fontSize: '0.78rem', fontWeight: 600,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a13 13 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
        </svg>
        WhatsApp
      </button>

      {/* Facebook */}
      <button
        onClick={() => openShare(links.facebook)}
        title="Partager sur Facebook"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: '#1877F2', color: '#fff',
          border: 'none', borderRadius: '20px',
          padding: '0.35rem 0.85rem', cursor: 'pointer',
          fontSize: '0.78rem', fontWeight: 600,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Facebook
      </button>

      {/* Twitter / X */}
      <button
        onClick={() => openShare(links.twitter)}
        title="Partager sur Twitter"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: '#000', color: '#fff',
          border: 'none', borderRadius: '20px',
          padding: '0.35rem 0.85rem', cursor: 'pointer',
          fontSize: '0.78rem', fontWeight: 600,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        X
      </button>

      {/* Copier le lien */}
      <button
        onClick={copyLink}
        title="Copier le lien"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: copied ? 'rgba(4,187,255,0.15)' : 'rgba(255,255,255,0.07)',
          color: copied ? 'var(--clr-accent)' : 'var(--clr-muted)',
          border: `1px solid ${copied ? 'var(--clr-accent)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: '20px',
          padding: '0.35rem 0.85rem', cursor: 'pointer',
          fontSize: '0.78rem', fontWeight: 600,
          transition: 'all 0.2s',
        }}
      >
        {copied ? (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Copié !
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copier
          </>
        )}
      </button>
    </div>
  );
}
