import Link from 'next/link';
import NewsletterForm from '@/components/NewsletterForm';

export const metadata = {
  title: 'Blog – Tech-Geo',
  description: 'Conseils tech, tutoriels et actualités pour développeurs et passionnés d\'électronique.',
};

const posts = [
  {
    slug: 'creer-site-web-togo',
    title: 'Comment créer un site web professionnel au Togo en 2024',
    category: 'Web',
    date: '12 Jan 2025',
    readTime: '5 min',
    excerpt: 'Tout ce qu\'il faut savoir pour lancer votre présence en ligne : choix du nom de domaine, hébergement local ou international, budget et conseils pratiques.',
    icon: '🌐',
    color: '#3498db',
  },
  {
    slug: 'arduino-debutant',
    title: 'Arduino pour débutants : vos 5 premiers projets',
    category: 'Électronique',
    date: '8 Jan 2025',
    readTime: '8 min',
    excerpt: 'Découvrez comment démarrer avec Arduino sans expérience : LED clignotante, capteur de température, alarme sonore… 5 projets simples et amusants.',
    icon: '🔌',
    color: '#e67e22',
  },
  {
    slug: 'mobile-money-ecommerce',
    title: 'Intégrer Mobile Money dans votre boutique en ligne',
    category: 'E-commerce',
    date: '2 Jan 2025',
    readTime: '6 min',
    excerpt: 'Guide complet pour accepter les paiements Flooz et T-Money sur votre site e-commerce. API, sécurité et meilleures pratiques.',
    icon: '💳',
    color: '#27ae60',
  },
  {
    slug: 'python-automatisation',
    title: 'Python : automatisez vos tâches quotidiennes',
    category: 'Programmation',
    date: '28 Déc 2024',
    readTime: '7 min',
    excerpt: 'Envoi d\'emails automatiques, renommage de fichiers, scraping de données… Python peut vous faire gagner des heures chaque semaine.',
    icon: '🐍',
    color: '#9b59b6',
  },
  {
    slug: 'seo-afrique',
    title: 'SEO en Afrique : comment apparaître en premier sur Google',
    category: 'Marketing',
    date: '20 Déc 2024',
    readTime: '9 min',
    excerpt: 'Les spécificités du référencement naturel pour les marchés africains : mots-clés locaux, vitesse de chargement, contenu en langues locales.',
    icon: '📈',
    color: '#e74c3c',
  },
  {
    slug: 'raspberry-pi-serveur',
    title: 'Transformer un Raspberry Pi en serveur web local',
    category: 'Électronique',
    date: '15 Déc 2024',
    readTime: '10 min',
    excerpt: 'Hébergez votre propre serveur à la maison avec un Raspberry Pi. Installation, configuration, sécurité et accès distant pas à pas.',
    icon: '🍓',
    color: '#c0392b',
  },
];

const categories = ['Tous', 'Web', 'Électronique', 'Programmation', 'E-commerce', 'Marketing'];

export default function BlogPage() {
  return (
    <>
      <section
        className="hero-sm"
        style={{ backgroundImage: 'url(/images/tutorial-photos/motherboard-background.webp)' }}
      >
        <div className="container">
          <h1>Blog Tech-Geo</h1>
          <p>Conseils, tutoriels et actualités pour développeurs et passionnés de technologie.</p>
        </div>
      </section>

      {/* Categories */}
      <section className="section" style={{ paddingBottom: '0.5rem' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`btn ${cat === 'Tous' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                style={{ borderRadius: '20px', padding: '0.35rem 1rem', fontSize: '0.85rem' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured post */}
      <section className="section" style={{ paddingBottom: '1rem' }}>
        <div className="container">
          <div
            className="card"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              padding: '2rem',
              border: '2px solid var(--clr-teal)',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #3498db22, #3498db44)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '5rem',
                minHeight: '200px',
              }}
            >
              🌐
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ background: 'var(--clr-accent)', color: '#000', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                  ⭐ À LA UNE
                </span>
                <span style={{ color: 'var(--clr-muted)', fontSize: '0.8rem' }}>Web · 5 min · 12 Jan 2025</span>
              </div>
              <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.3rem', lineHeight: 1.3 }}>
                {posts[0].title}
              </h2>
              <p style={{ color: 'var(--clr-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                {posts[0].excerpt}
              </p>
              <Link href={`/blog/${posts[0].slug}`} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                Lire l'article →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Tous les articles</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {posts.slice(1).map((post) => (
              <article key={post.slug} className="card" style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    height: '120px',
                    background: `linear-gradient(135deg, ${post.color}22, ${post.color}44)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    borderBottom: `2px solid ${post.color}`,
                  }}
                >
                  {post.icon}
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        background: 'rgba(0,230,176,0.1)',
                        border: '1px solid var(--clr-teal)',
                        color: 'var(--clr-accent)',
                        fontSize: '0.72rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '20px',
                      }}
                    >
                      {post.category}
                    </span>
                    <span style={{ color: 'var(--clr-muted)', fontSize: '0.75rem' }}>{post.readTime}</span>
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', lineHeight: 1.4 }}>{post.title}</h3>
                  <p style={{ color: 'var(--clr-muted)', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
                    {post.excerpt}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--clr-muted)', fontSize: '0.75rem' }}>{post.date}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      style={{ color: 'var(--clr-accent)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}
                    >
                      Lire →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section" style={{ borderTop: '1px solid var(--clr-teal)' }}>
        <div className="container text-center">
          <h2>Ne ratez aucun article</h2>
          <p className="mb-4">Inscrivez-vous à la newsletter pour recevoir nos nouveaux articles chaque semaine.</p>
          <NewsletterForm buttonText="S'abonner" />
        </div>
      </section>
    </>
  );
}
