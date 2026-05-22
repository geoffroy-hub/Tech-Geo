import Link from 'next/link';

export default function SteamPage() {
  return (
    <>
      <section className="hero-sm" style={{ backgroundImage: 'url(/images/tutorial-photos/motherboard-background.webp)' }}>
        <div className="container">
          <h1>Steam Lab</h1>
          <p>Simulation, streaming et environnements interactifs pour l&apos;apprentissage technique.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid-2">
            <Link href="/steam/games" className="card hover-lift" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎮</div>
              <h3>Steam Manifest Hub</h3>
              <p>Générateur de manifestes Steam et outils Lua.</p>
            </Link>
            <div className="card" style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔬</div>
              <h3>Simulations (Bientôt)</h3>
              <p>Environnements interactifs pour l&apos;apprentissage.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
