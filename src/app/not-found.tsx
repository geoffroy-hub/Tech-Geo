import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section" style={{ paddingTop: '8rem', textAlign: 'center' }}>
      <div className="container">
        <h1 style={{ fontSize: '6rem', margin: 0, lineHeight: 1 }}>404</h1>
        <h2>Page non trouvée</h2>
        <p>La page que vous cherchez n&apos;existe pas ou a été déplacée.</p>
        <Link href="/" className="btn btn-primary">Retour à l&apos;accueil</Link>
      </div>
    </section>
  );
}
