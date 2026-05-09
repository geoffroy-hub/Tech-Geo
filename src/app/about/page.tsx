import Link from 'next/link';

export default function AboutPage() {
  return (
    <section className="section" style={{ paddingTop: '6rem' }}>
      <div className="container">
        <h1>À propos de Tech‑Geo</h1>
        <p>Tech‑Geo est une plateforme d&apos;apprentissage en électronique et informatique.</p>
        <div className="grid-2">
          <div className="card">
            <h3>Notre Mission</h3>
            <p>Démocratiser l&apos;accès à la connaissance en électronique et en informatique pour tous, en fournissant des tutoriels de qualité, des schémas de circuits détaillés et une boutique de composants.</p>
          </div>
          <div className="card">
            <h3>Notre Vision</h3>
            <p>Créer une communauté d&apos;apprenants et de passionnés qui partagent leurs connaissances et innovent ensemble dans le domaine de la technologie.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
