import Link from 'next/link';
import Image from 'next/image';
import NewsletterForm from '@/components/NewsletterForm';

export default function AboutPage() {
  const team = [
    { name: 'Geoffroy', role: 'Fondateur & Développeur', bio: 'Passionné d\'électronique et de programmation, Geoffroy a créé Tech-geo pour partager sa passion et aider les débutants à se lancer.', img: '/images/à propos/MK17.webp' },
    { name: 'N\'devor', role: 'Expert Technique', bio: 'Spécialiste en robotique et systèmes embarqués, il apporte son expertise technique aux tutoriels et cours.', img: '/images/à propos/XTROZ.webp' },
    { name: 'Safiou', role: 'Rédacteur & Tutoriel', bio: 'Lourd contributeur à l\'élaboration de chaque contenu écrit des tutoriels et s\'adapte à tous les niveaux.', img: '/images/à propos/OK.webp' },
    { name: 'Abdoul-Razak', role: 'Expert Hardware', bio: 'Passionné par le design de PCB et l\'optimisation des circuits, il veille à la qualité du matériel proposé.', img: '/images/à propos/82462.webp' },
  ];

  const values = [
    { title: 'Accessibilité', desc: 'Rendre la technologie compréhensible pour tous, quel que soit le niveau de départ.', icon: '📊' },
    { title: 'Innovation', desc: 'Toujours explorer les nouvelles technologies et méthodes d\'apprentissage.', icon: '🚀' },
    { title: 'Communauté', desc: 'Créer un espace d\'entraide et de partage de connaissances.', icon: '🤝' },
  ];

  return (
    <>
      <section className="hero-sm" style={{ backgroundImage: 'url(/images/tutorial-photos/motherboard-background.webp)' }}>
        <div className="container">
          <h1>À propos de Tech-geo</h1>
          <p>Une équipe passionnée par l&apos;électronique, forte par la transmission du savoir.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="about-story">
            <div className="about-story-image" style={{ position: 'relative', minHeight: '260px' }}>
              <Image src="/images/tutorial-photos/technical-schematic-diagram-analog-electronic-260nw-2505467983.webp" alt="Notre Mission" fill style={{ objectFit: 'cover', borderRadius: '12px' }} sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
            <div className="about-story-text">
              <h2>Notre mission</h2>
              <p>Tech-geo est né de la volonté de rendre l&apos;apprentissage de l&apos;électronique et de l&apos;informatique accessible à tous. Nous croyons que la technologie est un levier puissant pour le développement personnel et professionnel.</p>
              <p>Notre plateforme propose des cours structurés, des tutoriels pratiques et une boutique de composants pour vous donner tous les outils nécessaires à votre progression.</p>
              <Link href="/contact" className="btn btn-primary">Nous contacter</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'rgba(5, 28, 36, 0.4)' }}>
        <div className="container">
          <h2 className="section-title">Notre équipe</h2>
          <div className="grid-team" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem', 
            marginTop: '3rem' 
          }}>
            {team.map(member => (
              <div key={member.name} className="card team-card">
                <div className="team-avatar" style={{ overflow: 'hidden', padding: 0, position: 'relative' }}>
                  <Image src={member.img} alt={member.name} fill style={{ objectFit: 'cover' }} sizes="250px" />
                </div>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
                <div className="social-links-modern" style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem', justifyContent: 'center' }}>
                  <a href="#" className="social-icon-box instagram" title="Instagram" style={{ width: '32px', height: '32px', padding: '6px' }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram" />
                  </a>
                  <a href="#" className="social-icon-box facebook" title="Facebook" style={{ width: '32px', height: '32px', padding: '5px' }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_(2019).png" alt="Facebook" />
                  </a>
                  <a href="#" className="social-icon-box tiktok" title="TikTok" style={{ width: '32px', height: '32px', padding: '8px' }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/34/Ionicons_logo-tiktok.svg" alt="TikTok" style={{ filter: 'invert(1)' }} />
                  </a>
                  <a href="#" className="social-icon-box whatsapp" title="WhatsApp" style={{ width: '32px', height: '32px', padding: '6px' }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
                  </a>
                  <a href="#" className="social-icon-box linkedin" title="LinkedIn" style={{ width: '32px', height: '32px', padding: '6px' }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn" />
                  </a>
                  <a href="#" className="social-icon-box x" title="X (Twitter)" style={{ width: '32px', height: '32px', padding: '8px' }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/X_logo_2023_original.svg" alt="X" style={{ filter: 'invert(1)' }} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Nos valeurs</h2>
          <div className="grid-3">
            {values.map(v => (
              <div key={v.title} className="card value-card">
                <div className="value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ borderTop: '1px solid var(--clr-teal)' }}>
        <div className="container text-center">
          <h2>Rejoignez l&apos;aventure</h2>
          <p className="mb-4">Inscrivez-vous à notre newsletter pour recevoir les derniers tutoriels et nouveaux produits en avant-première.</p>
          <NewsletterForm buttonText="S'abonner" />
        </div>
      </section>
    </>
  );
}

