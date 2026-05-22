'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabase } from '@/lib/supabase';

export default function BusinessPage() {
  const [hiveLink, setHiveLink] = useState('https://www.hiveqash.com/');

  useEffect(() => {
    async function loadSettings() {
      const supabase = getSupabase();
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'hiveqash_link').single();
      if (data) setHiveLink(data.value);
    }
    loadSettings();
  }, []);

  return (
    <div className="business-page">
      <section className="hero-sm" style={{ backgroundImage: 'url(/images/business-bg.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container">
          <h1 className="fade-in">Solutions Business</h1>
          <p className="fade-in" style={{ animationDelay: '0.1s' }}>Accompagnement et services dédiés aux entreprises et professionnels.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
            <h2 className="section-title">Opportunités de Croissance</h2>
            <p style={{ color: 'var(--clr-muted)' }}>Découvrez des solutions innovantes pour générer des revenus.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 400px))', justifyContent: 'center', gap: '2rem' }}>
            {/* HiveQash Promotion Card */}
            <div className="card hover-lift" style={{ overflow: 'hidden', padding: 0, border: '1px solid rgba(4, 187, 255, 0.2)', maxWidth: '350px', margin: '0 auto' }}>
              <div style={{ height: '500px', background: 'rgba(0,0,0,0.2)', position: 'relative' }}>
                <Image 
                  src="/images/Business/images.webp" 
                  alt="HiveQash Opportunity" 
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="350px"
                />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                  Transforme ton téléphone en entreprise juste avec <span style={{ color: 'var(--clr-accent)', fontWeight: 'bold' }}>4300 FCFA</span>
                </h3>
                <p style={{ color: 'var(--clr-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Rejoins HiveQash et commence à générer des revenus quotidiens grâce à une plateforme innovante et accessible à tous.
                </p>
                <Link 
                  href={hiveLink} 
                  target="_blank"
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', fontWeight: 'bold' }}
                >
                  Commence maintenant
                </Link>
              </div>
            </div>

            {/* Placeholder for other business opportunities if needed */}
            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--clr-border)' }}>
              <div style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '1rem' }}>📈</div>
              <p style={{ color: 'var(--clr-muted)', fontSize: '0.9rem' }}>D&apos;autres opportunités arrivent bientôt...</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'rgba(4, 187, 255, 0.05)' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Services d&apos;Accompagnement</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h4 style={{ color: 'var(--clr-accent)', marginBottom: '0.5rem' }}>Expertise Technique</h4>
                <p style={{ fontSize: '0.9rem' }}>Conseil en architecture et déploiement de solutions sur mesure.</p>
              </div>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h4 style={{ color: 'var(--clr-accent)', marginBottom: '0.5rem' }}>Formation Pro</h4>
                <p style={{ fontSize: '0.9rem' }}>Programmes de formation adaptés aux besoins de vos équipes.</p>
              </div>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h4 style={{ color: 'var(--clr-accent)', marginBottom: '0.5rem' }}>Support Dédié</h4>
                <p style={{ fontSize: '0.9rem' }}>Une assistance prioritaire 24/7 pour vos systèmes critiques.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
