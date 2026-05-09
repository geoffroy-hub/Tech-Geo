'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SteamGamesPage() {
  const [appId, setAppId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [terminalText, setTerminalText] = useState('');
  const [manifestFound, setManifestFound] = useState<boolean | null>(null);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [checking, setChecking] = useState(false);

  const typeText = async (text: string) => {
    for (let i = 0; i < text.length; i++) {
      await new Promise((r) => setTimeout(r, 20));
      setTerminalText((prev) => prev + text.charAt(i));
    }
  };

  const checkManifest = async () => {
    const id = appId.trim();
    if (!id || !/^\d+$/.test(id)) {
      setShowResults(true);
      setTerminalText(`> ERROR: Please enter a valid Steam AppID (numbers only)\n`);
      return;
    }

    setLoading(true);
    setChecking(true);
    setManifestFound(null);
    setShowResults(true);
    setTerminalText('');
    setDownloadUrl('');

    await typeText(`> Initiating manifest check for Steam AppID: ${id}\n`);
    await typeText(`> Searching database...\n`);

    try {
      const res = await fetch(`https://api.github.com/repos/SSMGAlt/ManifestHub2/branches/${id}`);
      if (res.status === 200) {
        await typeText(`> Manifest found in database!\n`);
        await typeText(`> Preparing download link...\n`);
        await typeText(`> Ready for download.\n`);
        setManifestFound(true);
        setDownloadUrl(`https://codeload.github.com/SSMGAlt/ManifestHub2/zip/refs/heads/${id}`);
      } else {
        await typeText(`> Manifest not found.\n`);
        setManifestFound(false);
      }
    } catch {
      await typeText(`> Error checking manifest. Please try again.\n`);
      setManifestFound(false);
    }

    setLoading(false);
    setChecking(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') checkManifest();
  };

  if (showDisclaimer) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(5, 28, 36, 0.85)',
        backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'center',
        alignItems: 'center', zIndex: 2000,
      }}>
        <div style={{
          background: 'linear-gradient(145deg, #0a3d62, #051c24)',
          border: '1px solid var(--clr-teal)', borderRadius: '1.5rem',
          padding: '3rem', maxWidth: 550, width: '90%', textAlign: 'center',
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)',
        }}>
          <div style={{ fontSize: '2.5rem', color: '#f59e0b', marginBottom: '1rem' }}>⚠️</div>
          <h2 className="section-title">DISCLAIMER</h2>
          <div style={{ textAlign: 'left', margin: '1.5rem 0' }}>
            <h3 style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>README:</h3>
            <p style={{ color: 'var(--clr-muted)', lineHeight: 1.6 }}>
              This website is for informational purposes only. We are not responsible for any consequences
              that may arise from using the provided data.
            </p>
          </div>
          <button
            className="btn btn-primary ripple"
            onClick={() => setShowDisclaimer(false)}
          >
            I Understand & Accept The Risks
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="hero-sm" style={{ backgroundImage: 'url(/images/tutorial-photos/steam.jpg)' }}>
        <div className="container">
          <h1 className="section-title">steam:tech-geo</h1>
          <p style={{ color: 'var(--clr-muted)' }}>Générateur de manifestes Steam pour Tech-Geo</p>
          <p style={{ marginTop: '0.5rem' }}>
            Made By{' '}
            <Link href="https://t.me/TechGeo" style={{ color: '#a78bfa' }}>Tech-Geo</Link>
          </p>
          <p>
            <Link href="https://www.steamtools.net/" style={{ color: 'var(--clr-accent)' }}>
              Download SteamTools
            </Link>
          </p>
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
            <div className="input-row" style={{
              display: 'flex', gap: '2rem', alignItems: 'flex-end',
              justifyContent: 'center', flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: 250 }}>
                <label style={{
                  display: 'block', marginBottom: '0.75rem', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '1px',
                }}>
                  Steam Application ID
                </label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ex: 730"
                  style={{
                    width: '100%', padding: '1.5rem 2rem',
                    border: '1px solid rgba(4, 187, 255, 0.3)', borderRadius: '1rem',
                    background: 'rgba(255,255,255,0.05)', color: 'white',
                    fontFamily: 'inherit', fontSize: '1.2rem',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--clr-accent)';
                    e.target.style.boxShadow = '0 0 20px rgba(4, 187, 255, 0.4)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(4, 187, 255, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <button
                className="btn btn-primary ripple"
                onClick={checkManifest}
                disabled={loading}
                style={{
                  padding: '1.5rem 3rem', fontSize: '1.1rem',
                  animation: loading ? 'none' : 'pulse 2s infinite',
                }}
              >
                {loading ? 'CHECKING...' : 'VERIFY MANIFEST'}
              </button>
            </div>

            {showResults && (
              <>
                <div style={{
                  background: '#051c24', borderRadius: '0.75rem',
                  overflow: 'hidden', border: '1px solid rgba(4, 187, 255, 0.3)',
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)', marginTop: '2rem',
                }}>
                  <div style={{
                    background: 'rgba(0,60,87,0.8)', padding: '0.75rem 1rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    borderBottom: '1px solid rgba(4,187,255,0.2)',
                  }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }}></span>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }}></span>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }}></span>
                    <span style={{
                      marginLeft: '0.5rem', fontSize: '0.8rem',
                      color: 'var(--clr-muted)', fontFamily: 'monospace',
                      textTransform: 'uppercase', letterSpacing: '1px',
                    }}>
                      system_terminal.exe
                    </span>
                  </div>
                  <pre style={{
                    color: '#4ade80', fontFamily: '"Courier New", monospace',
                    padding: '1.5rem', height: 250, overflowY: 'auto',
                    whiteSpace: 'pre-wrap', fontSize: '1rem', lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {terminalText}
                  </pre>
                </div>

                {manifestFound === true && (
                  <div style={{
                    margin: '2rem 0', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '1rem',
                  }}>
                    <a
                      href={downloadUrl}
                      className="btn btn-primary ripple"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                        padding: '1.25rem 3rem', fontSize: '1.1rem',
                      }}
                    >
                      <span>📥</span> DOWNLOAD MANIFEST ZIP
                    </a>
                    <p style={{ color: 'var(--clr-muted)' }}>
                      Files are fetched from{' '}
                      <Link href="https://github.com/SSMGAlt/ManifestHub2" style={{ color: 'var(--clr-accent)' }}>
                        ManifestHub
                      </Link>
                    </p>
                  </div>
                )}

                {manifestFound === false && !checking && (
                  <div style={{
                    marginTop: '1.5rem',
                    display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2rem',
                    border: '1px solid #ff4757', borderRadius: '1rem',
                    background: 'rgba(255, 71, 87, 0.1)',
                  }}>
                    <span style={{ fontSize: '2.5rem' }}>⚠️</span>
                    <div>
                      <h3 style={{ color: '#ff4757', margin: 0 }}>MANIFEST NOT FOUND</h3>
                      <p style={{ color: 'var(--clr-muted)', margin: '0.5rem 0 0' }}>
                        We couldn&apos;t find a manifest for this AppID in our automated database.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--clr-border)' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2rem', padding: '1rem 0',
            }}>
              <div className="card hover-lift" style={{ padding: '2rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                <h3>Analyse</h3>
                <p style={{ color: 'var(--clr-muted)' }}>
                  <span style={{ display: 'block', color: '#ff4757', fontWeight: 600, marginBottom: '0.5rem' }}>
                    DATABASE UPDATE: 05/2026
                  </span>
                  Notre système vérifie la disponibilité des manifestes en temps réel via l&apos;API GitHub
                  et notre base de données sécurisée.
                </p>
              </div>
              <div className="card hover-lift" style={{ padding: '2rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
                <h3>Stockage</h3>
                <p style={{ color: 'var(--clr-muted)' }}>
                  Tous les fichiers sont archivés de manière redondante sur ManifestHub pour garantir
                  une disponibilité maximale.
                </p>
              </div>
              <div className="card hover-lift" style={{ padding: '2rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛡️</div>
                <h3>Confidentialité</h3>
                <p style={{ color: 'var(--clr-muted)' }}>
                  Aucune donnée personnelle n&apos;est collectée. Le processus de vérification est
                  transparent et sécurisé.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
