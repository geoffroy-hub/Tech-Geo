'use client';

import { useState } from 'react';

export default function SteamGamesPage() {
  const [appId, setAppId] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchManifest = async () => {
    if (!appId.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`https://api.github.com/repos/tech-geo/steam-manifests/contents/manifests/${appId.trim()}.txt`);
      if (!res.ok) throw new Error('Manifeste non trouvé');
      const data = await res.json();
      const content = atob(data.content);
      setResult(content);
    } catch (err: any) {
      setError(err.message || 'Erreur de récupération');
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manifest_${appId.trim()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <section className="hero-sm" style={{ backgroundImage: 'url(/images/tutorial-photos/motherboard-background.jpg)' }}>
        <div className="container">
          <h1>Steam Manifest Hub</h1>
          <p>Générateur et récupérateur de manifestes Steam.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="generator-card" style={{
            background: 'rgba(0, 60, 87, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(4, 187, 255, 0.2)',
            borderRadius: '1.5rem',
            padding: '3rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            marginBottom: '3rem',
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Récupérer un manifeste</h2>
            <p style={{ marginBottom: '2rem', color: 'var(--clr-muted)' }}>
              Entrez un App ID Steam pour récupérer son manifeste.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input
                type="number"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="Ex: 730 (CS:GO)"
                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--clr-border)', background: 'var(--clr-bg)', color: 'var(--clr-text)' }}
              />
              <button className="btn btn-primary" onClick={fetchManifest} disabled={loading}>
                {loading ? 'Chargement...' : 'Récupérer'}
              </button>
            </div>

            {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}

            {result && (
              <div className="terminal-container" style={{
                background: '#051c24',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                border: '1px solid rgba(4, 187, 255, 0.3)',
              }}>
                <div className="terminal-header" style={{
                  background: 'rgba(0,60,87,0.8)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(4,187,255,0.2)',
                }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }}></span>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }}></span>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }}></span>
                  </div>
                  <span style={{ color: '#4ade80', fontSize: '0.8rem' }}>manifest_{appId.trim()}.txt</span>
                </div>
                <pre style={{
                  padding: '1.5rem',
                  margin: 0,
                  color: '#4ade80',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  maxHeight: 400,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}>{result}</pre>
              </div>
            )}

            {result && (
              <button className="btn btn-outline" onClick={downloadResult} style={{ marginTop: '1rem' }}>
                Télécharger
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
