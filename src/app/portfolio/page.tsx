import Link from 'next/link';
import Image from 'next/image';
import NewsletterForm from '@/components/NewsletterForm';

export const metadata = {
  title: 'Portfolio – Tech-Geo',
  description: 'Sites web réalisés et projets électronique par Tech-Geo au Togo et en Afrique.',
};

const webProjects = [
  {
    id: 1,
    name: 'Restaurant Le Saveur',
    category: 'Restaurant',
    plan: 'Business',
    desc: 'Site vitrine avec menu en ligne, galerie photos et système de réservation de table.',
    tags: ['Next.js', 'Responsive', 'SEO'],
    color: '#f39c12',
    icon: '🍽️',
  },
  {
    id: 2,
    name: 'Boutique Mode Lomé',
    category: 'E-commerce',
    plan: 'E-commerce',
    desc: 'Boutique en ligne complète avec catalogue, panier, paiement Mobile Money et tableau de bord admin.',
    tags: ['E-commerce', 'Mobile Money', 'Admin'],
    color: '#9b59b6',
    icon: '👗',
  },
  {
    id: 3,
    name: 'ONG EduTogo',
    category: 'ONG / Associatif',
    plan: 'Business',
    desc: 'Site institutionnel avec blog, formulaire de don et espace bénévoles.',
    tags: ['Blog', 'Dons en ligne', 'Multilingue'],
    color: '#27ae60',
    icon: '🌍',
  },
  {
    id: 4,
    name: 'Cabinet Dr. Amavi',
    category: 'Santé',
    plan: 'Starter',
    desc: 'Présentation d\'un cabinet médical avec prise de rendez-vous en ligne.',
    tags: ['RDV en ligne', 'Responsive', 'Sécurisé'],
    color: '#2980b9',
    icon: '🏥',
  },
  {
    id: 5,
    name: 'Auto-École Liberté',
    category: 'Formation',
    plan: 'Business',
    desc: 'Site avec programme de formation, tarifs, témoignages et formulaire d\'inscription.',
    tags: ['Formulaire', 'SEO', 'Responsive'],
    color: '#e74c3c',
    icon: '🚗',
  },
  {
    id: 6,
    name: 'Salon Beauté Awa',
    category: 'Beauté & Bien-être',
    plan: 'Starter',
    desc: 'Site vitrine élégant avec galerie de réalisations, tarifs et contact WhatsApp.',
    tags: ['Galerie', 'WhatsApp', 'Responsive'],
    color: '#e91e8c',
    icon: '💅',
  },
];

const electroProjects = [
  {
    id: 1,
    name: 'Voiture Arduino Bluetooth',
    category: 'Robotique',
    desc: 'Voiture télécommandée via Bluetooth construite avec Arduino Uno, ponts en H L298N et moteurs DC.',
    tags: ['Arduino', 'Bluetooth', 'L298N', 'C++'],
    color: '#00e6b0',
    icon: '🚗',
    img: '/images/tutorial-photos/Arduino Bluetooth Car Building 🛠.webp',
  },
  {
    id: 2,
    name: 'Régulateur LM317',
    category: 'Alimentation',
    desc: 'Alimentation variable de 1.25V à 25V avec le LM317 — schéma complet et PCB.',
    tags: ['LM317', 'PCB', 'Alimentation', 'Analogique'],
    color: '#f39c12',
    icon: '⚡',
    img: '/images/tutorial-photos/Régulateur de tension LM317 _ montages - Astuces Pratiques.webp',
  },
  {
    id: 3,
    name: 'Indicateur LED Distance',
    category: 'Capteurs',
    desc: 'Circuit de mesure de distance ultrasonique avec affichage LED progressif sur 10 niveaux.',
    tags: ['HC-SR04', 'Arduino', 'LED', 'Ultrason'],
    color: '#2980b9',
    icon: '📡',
    img: '/images/tutorial-photos/LED DISTANCE INDICATOR.webp',
  },
  {
    id: 4,
    name: 'Régulateurs 78xx Series',
    category: 'Alimentation',
    desc: 'Comparatif et montages pratiques de la série 78xx : 7805, 7809, 7812 — guide complet.',
    tags: ['7805', '7812', 'Régulateur', 'Linéaire'],
    color: '#8e44ad',
    icon: '🔌',
    img: '/images/tutorial-photos/78xx Regulators.webp',
  },
  {
    id: 5,
    name: 'Comparaison Microcontrôleurs',
    category: 'Microcontrôleurs',
    desc: 'Benchmark détaillé Arduino vs ESP8266 vs ESP32 : performances, prix, consommation et usages.',
    tags: ['Arduino', 'ESP32', 'ESP8266', 'Benchmark'],
    color: '#27ae60',
    icon: '🧠',
    img: '/images/tutorial-photos/Arduino vs ESP8266 vs ESP32 Microcontroller Comparison - DIYI0T.webp',
  },
  {
    id: 6,
    name: 'Atelier Soudure Composants',
    category: 'Atelier',
    desc: 'Initiation à la soudure de composants radio et SMD — techniques et bonnes pratiques.',
    tags: ['Soudure', 'SMD', 'Radio', 'Atelier'],
    color: '#e74c3c',
    icon: '🔧',
    img: '/images/tutorial-photos/various-radio-components-soldering-iron-600nw-2695650513.webp',
  },
];

const stats = [
  { value: '20+', label: 'Sites livrés' },
  { value: '15+', label: 'Projets électro' },
  { value: '100%', label: 'Clients satisfaits' },
  { value: '5j', label: 'Délai min.' },
];

export default function PortfolioPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-sm" style={{ backgroundImage: 'url(/images/tutorial-photos/motherboard-background.webp)' }}>
        <div className="container">
          <h1>Notre Portfolio</h1>
          <p>Sites web professionnels et projets électronique réalisés au Togo et en Afrique.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="section" style={{ paddingBottom: '1rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.25rem' }}>
            {stats.map((s) => (
              <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--clr-accent)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ marginTop: '0.4rem', color: 'var(--clr-muted)', fontSize: '0.9rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projets Web */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Sites Web réalisés</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {webProjects.map((p) => (
              <div key={p.id} className="card hover-lift animate-on-scroll" style={{ overflow: 'hidden' }}>
                <div style={{
                  height: '140px',
                  background: `linear-gradient(135deg, ${p.color}22, ${p.color}44)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3.5rem', borderBottom: `3px solid ${p.color}`, position: 'relative',
                }}>
                  {p.icon}
                  <span style={{
                    position: 'absolute', top: '0.75rem', right: '0.75rem',
                    background: 'var(--clr-accent)', color: '#000',
                    fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px',
                  }}>{p.plan}</span>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--clr-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.category}</div>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>{p.name}</h3>
                  <p style={{ color: 'var(--clr-muted)', fontSize: '0.85rem', margin: '0 0 1rem', lineHeight: 1.5 }}>{p.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {p.tags.map((t) => (
                      <span key={t} style={{
                        background: 'rgba(0,230,176,0.1)', border: '1px solid var(--clr-teal)',
                        color: 'var(--clr-accent)', fontSize: '0.7rem', padding: '0.18rem 0.55rem', borderRadius: '20px',
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projets Électronique */}
      <section className="section" style={{ background: 'rgba(0,60,87,0.2)' }}>
        <div className="container">
          <h2 className="section-title">Projets Électronique</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {electroProjects.map((p) => (
              <div key={p.id} className="card hover-lift animate-on-scroll" style={{ overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: '180px', background: '#0a1a22' }}>
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    style={{ objectFit: 'cover', opacity: 0.85 }}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(to top, ${p.color}55 0%, transparent 60%)`,
                  }} />
                  <span style={{
                    position: 'absolute', top: '0.75rem', left: '0.75rem',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    color: '#fff', fontSize: '0.68rem', fontWeight: 700,
                    padding: '0.2rem 0.6rem', borderRadius: '20px',
                    border: `1px solid ${p.color}66`,
                  }}>{p.category}</span>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>{p.icon} {p.name}</h3>
                  <p style={{ color: 'var(--clr-muted)', fontSize: '0.85rem', margin: '0 0 1rem', lineHeight: 1.5 }}>{p.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {p.tags.map((t) => (
                      <span key={t} style={{
                        background: 'rgba(0,230,176,0.1)', border: '1px solid var(--clr-teal)',
                        color: 'var(--clr-accent)', fontSize: '0.7rem', padding: '0.18rem 0.55rem', borderRadius: '20px',
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ borderTop: '1px solid var(--clr-teal)' }}>
        <div className="container text-center">
          <h2>Votre projet, notre prochain succès</h2>
          <p style={{ color: 'var(--clr-muted)', marginBottom: '1.5rem' }}>
            Site web ou projet électronique — rejoignez nos clients satisfaits.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/site" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
              Commander mon site →
            </Link>
            <Link href="/contact" className="btn btn-outline" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
              Discuter d&apos;un projet
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section" style={{ borderTop: '1px solid var(--clr-teal)' }}>
        <div className="container text-center">
          <h2>Restez informé</h2>
          <p style={{ marginBottom: '1.5rem' }}>Recevez nos offres et projets directement dans votre boîte mail.</p>
          <NewsletterForm buttonText="S'abonner" />
        </div>
      </section>
    </>
  );
}
