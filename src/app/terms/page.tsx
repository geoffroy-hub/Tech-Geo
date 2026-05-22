import Link from 'next/link';

export default function TermsPage() {
  return (
    <section className="section" style={{ paddingTop: '6rem' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1>Conditions d&apos;utilisation</h1>
        <p>Dernière mise à jour : 2026</p>
        <h2>1. Acceptation</h2>
        <p>En utilisant ce site, vous acceptez ces conditions d&apos;utilisation.</p>
        <h2>2. Utilisation du service</h2>
        <p>Vous vous engagez à utiliser le site conformément aux lois en vigueur et à ne pas perturber son fonctionnement.</p>
        <h2>3. Commandes</h2>
        <p>Les commandes passées sur la boutique sont sujettes à disponibilité des stocks. Nous nous réservons le droit d&apos;annuler une commande.</p>
        <h2>4. Responsabilité</h2>
        <p>Tech-Geo ne saurait être tenu responsable des dommages indirects liés à l&apos;utilisation du site.</p>
      </div>
    </section>
  );
}
