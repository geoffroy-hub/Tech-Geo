import Link from 'next/link';
import NewsletterForm from '@/components/NewsletterForm';

export const metadata = {
  title: 'FAQ – Tech-Geo',
  description: 'Réponses aux questions fréquentes sur Tech-Geo : commandes, tutoriels, création de sites web et support.',
};

const faqSections = [
  {
    title: '🌐 Création de sites web',
    questions: [
      {
        q: 'Quel est le prix minimum pour un site web ?',
        a: 'Nos forfaits commencent à 12 000 FCFA pour un site Starter (1 à 3 pages). Ce forfait inclut le design responsive, un formulaire de contact, l\'hébergement 1 an et un nom de domaine.',
      },
      {
        q: 'Combien de temps faut-il pour livrer mon site ?',
        a: 'Délai selon le forfait : Starter en 5 jours, Business en 10 jours, E-commerce en 21 jours. Ces délais peuvent être réduits selon la disponibilité de votre contenu (textes, photos).',
      },
      {
        q: 'Comment se passe le paiement ?',
        a: 'Nous demandons un acompte de 50% au démarrage du projet et le solde à la livraison. Nous acceptons Mobile Money (Flooz, T-Money), virement bancaire et paiement en espèces à Lomé.',
      },
      {
        q: 'Vais-je recevoir les accès à mon site ?',
        a: 'Oui, à la livraison vous recevez tous les accès : panneau d\'administration, hébergement, domaine. Une formation à l\'utilisation est incluse.',
      },
      {
        q: 'Mon site sera-t-il visible sur mobile ?',
        a: 'Tous nos sites sont 100% responsive, testés sur mobile, tablette et ordinateur. La compatibilité mobile est une priorité absolue.',
      },
    ],
  },
  {
    title: '📦 Boutique & Commandes',
    questions: [
      {
        q: 'Livrez-vous dans toute l\'Afrique ?',
        a: 'Nous livrons principalement au Togo. La livraison internationale est disponible pour les petits composants via DHL ou colissimo, avec des frais variables selon le pays.',
      },
      {
        q: 'Comment suivre ma commande ?',
        a: 'Après validation, vous recevez un email de confirmation avec un numéro de suivi. Vous pouvez aussi consulter vos commandes dans votre espace "Mon compte".',
      },
      {
        q: 'Puis-je retourner un produit ?',
        a: 'Oui, les retours sont acceptés sous 7 jours après réception pour tout article défectueux ou non conforme. Contactez-nous via le formulaire de contact avec votre numéro de commande.',
      },
      {
        q: 'Les produits ont-ils une garantie ?',
        a: 'Les composants électroniques sont garantis 3 mois contre les défauts de fabrication. Le matériel informatique suit la garantie du fabricant (généralement 1 an).',
      },
    ],
  },
  {
    title: '📚 Tutoriels & Apprentissage',
    questions: [
      {
        q: 'Faut-il des prérequis pour suivre les tutoriels ?',
        a: 'Non, nos tutoriels débutent de zéro. Chaque cours indique le niveau requis (débutant, intermédiaire, avancé) pour que vous puissiez choisir le bon point de départ.',
      },
      {
        q: 'Les tutoriels sont-ils gratuits ?',
        a: 'La plupart de nos tutoriels de base sont gratuits. Certains cours avancés et formations complètes sont accessibles sur abonnement ou en achat unique.',
      },
      {
        q: 'Puis-je télécharger les fichiers de projet ?',
        a: 'Oui, chaque tutoriel inclut les fichiers sources téléchargeables (code, schémas, bibliothèques) accessibles depuis la page du cours.',
      },
    ],
  },
  {
    title: '👤 Compte & Support',
    questions: [
      {
        q: 'Comment créer un compte Tech-Geo ?',
        a: 'Cliquez sur l\'icône 👤 en haut à droite, puis sur "Créer un compte". Une confirmation email vous sera envoyée pour activer votre compte.',
      },
      {
        q: 'J\'ai oublié mon mot de passe, que faire ?',
        a: 'Sur la page de connexion, cliquez sur "Mot de passe oublié ?". Vous recevrez un lien de réinitialisation par email dans les 5 minutes.',
      },
      {
        q: 'Comment contacter le support ?',
        a: 'Vous pouvez nous contacter via le formulaire sur la page Contact, par email ou directement par WhatsApp au +228 XX XX XX XX. Nous répondons en moins de 24h.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <section
        className="hero-sm"
        style={{ backgroundImage: 'url(/images/tutorial-photos/motherboard-background.webp)' }}
      >
        <div className="container">
          <h1>Questions fréquentes</h1>
          <p>Toutes les réponses à vos questions sur Tech-Geo, nos services et nos produits.</p>
        </div>
      </section>

      {/* Quick links */}
      <section className="section" style={{ paddingBottom: '0.5rem' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            {faqSections.map((sec) => (
              <a
                key={sec.title}
                href={`#${sec.title.replace(/[^a-zA-Z]/g, '-')}`}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '20px', textDecoration: 'none', fontSize: '0.85rem' }}
              >
                {sec.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ sections */}
      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          {faqSections.map((sec) => (
            <div
              key={sec.title}
              id={sec.title.replace(/[^a-zA-Z]/g, '-')}
              style={{ marginBottom: '3rem' }}
            >
              <h2 style={{ marginBottom: '1.25rem', fontSize: '1.2rem' }}>{sec.title}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sec.questions.map((item) => (
                  <details
                    key={item.q}
                    className="card"
                    style={{ padding: '1.25rem 1.5rem', cursor: 'pointer' }}
                  >
                    <summary
                      style={{
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        listStyle: 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                      }}
                    >
                      {item.q}
                      <span style={{ color: 'var(--clr-accent)', flexShrink: 0, fontSize: '1.2rem' }}>+</span>
                    </summary>
                    <p
                      style={{
                        margin: '0.75rem 0 0',
                        color: 'var(--clr-muted)',
                        fontSize: '0.9rem',
                        lineHeight: 1.65,
                      }}
                    >
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still a question? */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container text-center" style={{ maxWidth: '600px' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤔</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Vous n'avez pas trouvé votre réponse ?</h2>
            <p style={{ color: 'var(--clr-muted)', marginBottom: '1.5rem' }}>
              Notre équipe est disponible pour répondre à toutes vos questions.
            </p>
            <Link href="/contact" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              Nous contacter →
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ borderTop: '1px solid var(--clr-teal)' }}>
        <div className="container text-center">
          <h2>Restez informé</h2>
          <p className="mb-4">Recevez nos conseils et actualités directement dans votre boîte mail.</p>
          <NewsletterForm buttonText="S'abonner" />
        </div>
      </section>
    </>
  );
}
