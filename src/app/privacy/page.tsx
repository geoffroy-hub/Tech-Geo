import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <section className="section" style={{ paddingTop: '6rem' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1>Politique de confidentialité</h1>
        <p>Dernière mise à jour : 2026</p>
        <h2>1. Collecte des données</h2>
        <p>Nous collectons les données que vous nous fournissez volontairement : nom, email, adresse de livraison lors d&apos;une commande.</p>
        <h2>2. Utilisation des données</h2>
        <p>Vos données sont utilisées pour traiter vos commandes, vous envoyer des newsletters (avec votre consentement) et améliorer nos services.</p>
        <h2>3. Partage des données</h2>
        <p>Nous ne partageons pas vos données personnelles avec des tiers, sauf si requis par la loi.</p>
        <h2>4. Vos droits</h2>
        <p>Vous pouvez à tout moment demander la suppression de vos données en nous contactant.</p>
      </div>
    </section>
  );
}
