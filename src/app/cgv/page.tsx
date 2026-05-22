import Link from 'next/link';
import '@/css/legal.css';

export const metadata = {
  title: 'Conditions Générales de Vente | Tech-Geo',
  description: 'Conditions générales de vente de Tech-Geo.',
};

export default function CGVPage() {
  return (
    <section className="section" style={{ paddingTop: '6rem' }}>
      <div className="container" style={{ maxWidth: 820 }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Conditions Générales de Vente</h1>
        <p style={{ color: 'var(--clr-muted)', marginBottom: '2.5rem' }}>Dernière mise à jour : Mai 2026 — Tech-Geo, Lomé, Togo</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2>1. Objet</h2>
            <p>Les présentes CGV régissent les relations entre <strong>Tech-Geo</strong> et tout Client souhaitant effectuer un achat via <strong>tech-geo.vercel.app</strong>. Toute commande implique l&apos;acceptation pleine des présentes CGV.</p>
          </div>
          <div>
            <h2>2. Produits et services</h2>
            <p>Tech-Geo propose : composants électroniques, logiciels numériques, création de sites web, clés Steam, accès API. Les descriptions sont aussi fidèles que possible. Le catalogue peut évoluer sans préavis.</p>
          </div>
          <div>
            <h2>3. Prix</h2>
            <p>Les prix sont en <strong>Francs CFA (XOF)</strong>. Le prix applicable est celui affiché à la validation de la commande. Tech-Geo se réserve le droit de corriger toute erreur manifeste.</p>
          </div>
          <div>
            <h2>4. Commande</h2>
            <p>La commande est validée après sélection des produits, remplissage du formulaire et confirmation de paiement. Un email ou message WhatsApp de confirmation est envoyé. Tech-Geo peut annuler toute commande en cas de suspicion de fraude.</p>
          </div>
          <div>
            <h2>5. Paiement</h2>
            <p>Modes acceptés : <strong>Mobile Money</strong> (Moov, T-Money, Orange Money, Wave, MTN MoMo…), <strong>virement bancaire</strong>, <strong>espèces</strong> (sur accord, à Lomé). Paiement sous <strong>48h</strong> après confirmation, sinon la commande peut être annulée.</p>
          </div>
          <div>
            <h2>6. Livraison</h2>
            <p><strong>Physique :</strong> Lomé et villes principales du Togo, 1 à 5 jours ouvrables.<br/><strong>Numérique / Sites web :</strong> par voie électronique, de quelques heures à 30 jours selon le forfait.</p>
          </div>
          <div>
            <h2>7. Rétractation et remboursements</h2>
            <p><strong>Produits physiques :</strong> 7 jours pour signaler un défaut, retour en état d&apos;origine requis.<br/><strong>Numérique :</strong> aucun remboursement après transmission du code/accès, sauf erreur de Tech-Geo.<br/><strong>Sites web :</strong> remboursement partiel si travaux non commencés ; avoir possible si conception débutée.</p>
          </div>
          <div>
            <h2>8. Garantie</h2>
            <p>Composants électroniques : <strong>30 jours</strong> contre défauts de fabrication. Ne couvre pas les dommages par mauvaise utilisation ou surtension.</p>
          </div>
          <div>
            <h2>9. Responsabilité</h2>
            <p>Tech-Geo n&apos;est pas responsable des dommages indirects. La responsabilité est limitée au montant de la commande concernée.</p>
          </div>
          <div>
            <h2>10. Données personnelles</h2>
            <p>Les données de commande sont utilisées uniquement pour son traitement et ne sont jamais vendues. Voir notre <Link href="/privacy" style={{ color: 'var(--clr-accent)' }}>Politique de confidentialité</Link>.</p>
          </div>
          <div>
            <h2>11. Litiges</h2>
            <p>Contact préalable : <a href="mailto:contact@tech-geo.vercel.app" style={{ color: 'var(--clr-accent)' }}>contact@tech-geo.vercel.app</a> ou <strong>+228 71 03 01 88</strong>. À défaut d&apos;accord amiable, les tribunaux de <strong>Lomé, Togo</strong> sont compétents.</p>
          </div>
          <div>
            <h2>12. Modification des CGV</h2>
            <p>Tech-Geo peut modifier ces CGV à tout moment. Les CGV applicables sont celles en vigueur à la date de la commande.</p>
          </div>
        </div>

        <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(4,187,255,0.05)', border: '1px solid var(--clr-teal)', borderRadius: 'var(--radius)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/contact" className="btn btn-primary">Nous contacter</Link>
          <Link href="/terms" className="btn btn-outline">Conditions d&apos;utilisation</Link>
          <Link href="/privacy" className="btn btn-outline">Confidentialité</Link>
        </div>
      </div>
    </section>
  );
}
