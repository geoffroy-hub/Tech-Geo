'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';

export default function ApiPage() {
  const [assistantPdf, setAssistantPdf] = useState('#');
  const [opencodePdf, setOpencodePdf] = useState('#');

  useEffect(() => {
    async function loadSettings() {
      const supabase = getSupabase();
      const { data } = await supabase.from('site_settings').select('key, value');
      if (data) {
        const aPdf = data.find(s => s.key === 'api_pdf_guide');
        const oPdf = data.find(s => s.key === 'opencode_pdf_guide');
        if (aPdf) setAssistantPdf(aPdf.value);
        if (oPdf) setOpencodePdf(oPdf.value);
      }
    }
    loadSettings();
  }, []);

  return (
    <div className="api-page">
      <section className="hero-sm" style={{ background: 'linear-gradient(135deg, #003c57 0%, #051c24 100%)' }}>
        <div className="container">
          <h1 className="fade-in">API & Développeurs</h1>
          <p className="fade-in" style={{ animationDelay: '0.1s' }}>Intégrez la puissance de Tech-Geo dans vos propres applications.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            
            {/* Assistant Personnel Guide */}
            <div className="card hover-lift" style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(4, 187, 255, 0.1) 0%, transparent 100%)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🤖</div>
              <h2 style={{ marginBottom: '1rem' }}>Assistant Personnel</h2>
              <p style={{ color: 'var(--clr-muted)', marginBottom: '2rem', lineHeight: '1.6', flex: 1 }}>
                Apprends comment obtenir une clé API et construire ton propre assistant intelligent personnalisé avec un guide complet en PDF.
              </p>
              <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Au programme :</h4>
                <ul style={{ fontSize: '0.85rem', color: 'var(--clr-muted)', paddingLeft: '1.2rem' }}>
                  <li>Obtention des clés API</li>
                  <li>Scripting de base</li>
                  <li>Déploiement et tests</li>
                </ul>
              </div>
              <a href={assistantPdf} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontWeight: 'bold' }}>
                📥 Télécharger le Guide PDF
              </a>
            </div>

            {/* Vibe Coding & OpenCode */}
            <div className="card hover-lift" style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(4, 187, 255, 0.1) 0%, transparent 100%)', display: 'flex', flexDirection: 'column', border: '1px solid rgba(4, 187, 255, 0.2)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✨</div>
              <h2 style={{ marginBottom: '1rem' }}>Vibe Coding & OpenCode</h2>
              <p style={{ color: 'var(--clr-muted)', marginBottom: '2rem', lineHeight: '1.6', flex: 1 }}>
                Maîtrisez l&apos;art du **Vibe Coding** gratuitement avec **OpenCode**. Apprenez à transformer vos idées en code simplement en décrivant vos intentions à l&apos;IA.
              </p>
              <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Configuration Vibe :</h4>
                <ul style={{ fontSize: '0.85rem', color: 'var(--clr-muted)', paddingLeft: '1.2rem' }}>
                  <li>Installation d&apos;OpenCode (Gratuit)</li>
                  <li>Prompt Engineering avancé</li>
                  <li>Workflow IA itératif</li>
                  <li>Déploiement en un clic</li>
                </ul>
              </div>
              <a href={opencodePdf} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontWeight: 'bold' }}>
                📥 Télécharger le Guide OpenCode
              </a>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
