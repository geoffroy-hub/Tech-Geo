import Link from 'next/link';
import Image from 'next/image';
import NewsletterForm from '@/components/NewsletterForm';

export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="hero">
        <div className="hero-video">
          <video autoPlay muted loop playsInline poster="/images/hero-poster.webp">
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero-overlay"></div>

        <div className="circuit-decoration">
          <div className="circuit-line horizontal" style={{ top: '20%', left: '5%' }}></div>
          <div className="circuit-line vertical" style={{ top: '15%', left: '10%' }}></div>
          <div className="circuit-line horizontal" style={{ top: '60%', right: '8%' }}></div>
          <div className="circuit-line vertical" style={{ top: '55%', right: '12%' }}></div>
          <div className="circuit-line horizontal" style={{ bottom: '25%', left: '15%' }}></div>
        </div>

        <div className="hero-content">
          <span className="hero-badge">Électronique · Informatique · Innovation</span>
          <h1>Bienvenue sur <span className="highlight">Tech‑Geo</span></h1>
          <p className="hero-description">
            Apprenez l&apos;électronique et l&apos;informatique grâce à des cours interactifs, des schémas de circuits, et une boutique de composants.
          </p>
          <div className="hero-buttons">
            <Link href="/tutorials" className="btn btn-primary ripple">Explorer les cours</Link>
            <Link href="/boutique" className="btn btn-outline ripple">Voir la boutique</Link>
          </div>
        </div>
      </section>

      {/* 2. Pourquoi Tech-Geo */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Pourquoi Tech‑Geo ?</h2>
          <div className="features-grid">
            <div className="card feature-card animate-on-scroll hover-lift ripple">
              <div className="feature-icon">&#9881;</div>
              <h3>Circuits & Schémas</h3>
              <p>Des schémas de circuits électroniques détaillés et expliqués pas à pas.</p>
            </div>
            <div className="card feature-card animate-on-scroll hover-lift ripple">
              <div className="feature-icon">&#128187;</div>
              <h3>Cours Informatique</h3>
              <p>Apprenez la programmation, le développement web et les réseaux.</p>
            </div>
            <div className="card feature-card animate-on-scroll hover-lift ripple">
              <div className="feature-icon">&#128722;</div>
              <h3>Boutique de Composants</h3>
              <p>Trouvez les composants électroniques et outils IT dont vous avez besoin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Cours populaires */}
      <section className="section" style={{ background: 'rgba(0,60,87,0.2)' }}>
        <div className="container">
          <h2 className="section-title">Cours populaires</h2>
          <div className="grid-3">
            <div className="card course-card animate-on-scroll hover-lift">
              <div className="course-card-image">
                <span className="placeholder-icon">&#9881;</span>
              </div>
              <div className="course-card-body">
                <span className="course-level">Débutant</span>
                <h3>Introduction à l&apos;Arduino</h3>
                <p>Découvrez les bases de la programmation et des circuits avec Arduino.</p>
                <Link href="/tutorials" className="btn btn-outline btn-sm ripple">Voir le cours</Link>
              </div>
            </div>
            <div className="card course-card animate-on-scroll hover-lift">
              <div className="course-card-image">
                <span className="placeholder-icon">&#128187;</span>
              </div>
              <div className="course-card-body">
                <span className="course-level">Intermédiaire</span>
                <h3>HTML & CSS modernes</h3>
                <p>Créez des sites web responsive avec les dernières technologies.</p>
                <Link href="/tutorials" className="btn btn-outline btn-sm ripple">Voir le cours</Link>
              </div>
            </div>
            <div className="card course-card animate-on-scroll hover-lift">
              <div className="course-card-image">
                <span className="placeholder-icon">&#128268;</span>
              </div>
              <div className="course-card-body">
                <span className="course-level">Avancé</span>
                <h3>Circuits imprimés PCB</h3>
                <p>Concevez et fabriquez vos propres circuits imprimés.</p>
                <Link href="/tutorials" className="btn btn-outline btn-sm ripple">Voir le cours</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Schémas de circuits */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Schémas de circuits</h2>
          <div className="grid-2">
            <div className="card schematic-card animate-on-scroll hover-lift">
              <div className="schematic-icon">&#9889;</div>
              <div className="schematic-info">
                <h4>LED avec résistance</h4>
                <p>Circuit simple pour allumer une LED avec une résistance de limitation.</p>
              </div>
            </div>
            <div className="card schematic-card animate-on-scroll hover-lift">
              <div className="schematic-icon">&#128268;</div>
              <div className="schematic-info">
                <h4>Capteur de température</h4>
                <p>Utilisation du LM35 avec Arduino pour mesurer la température.</p>
              </div>
            </div>
            <div className="card schematic-card animate-on-scroll hover-lift">
              <div className="schematic-icon">&#128225;</div>
              <div className="schematic-info">
                <h4>Amplificateur audio</h4>
                <p>Circuit d&apos;amplification audio basé sur le LM386.</p>
              </div>
            </div>
            <div className="card schematic-card animate-on-scroll hover-lift">
              <div className="schematic-icon">&#128161;</div>
              <div className="schematic-info">
                <h4>Alimentation stabilisée</h4>
                <p>Régulateur de tension 5V avec le LM7805.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Stats */}
      <section className="section stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item animate-on-scroll">
              <h3>50+</h3>
              <p>Tutoriels</p>
            </div>
            <div className="stat-item animate-on-scroll">
              <h3>200+</h3>
              <p>Composants</p>
            </div>
            <div className="stat-item animate-on-scroll">
              <h3>1K+</h3>
              <p>Étudiants</p>
            </div>
            <div className="stat-item animate-on-scroll">
              <h3>24/7</h3>
              <p>Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Témoignages */}
      <section className="section" style={{ background: 'rgba(5, 28, 36, 0.4)' }}>
        <div className="container">
          <h2 className="section-title">Ce que nos utilisateurs disent</h2>
          <div className="grid-3">
            <div className="card testimonial-card animate-on-scroll">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">« L&apos;équipe de Tech-geo est incroyable ! Mes projets d&apos;électronique fonctionnent enfin grâce à leurs conseils précieux. »</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">A</div>
                <div>
                  <div className="testimonial-name">Afi K.</div>
                  <div className="testimonial-meta">Il y a 2 semaines · Lomé</div>
                </div>
              </div>
            </div>
            <div className="card testimonial-card animate-on-scroll">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">« Meilleure plateforme d&apos;apprentissage technique à Lomé. Les tutoriels sont clairs et les composants sont de qualité. »</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">K</div>
                <div>
                  <div className="testimonial-name">Kossiwa D.</div>
                  <div className="testimonial-meta">Il y a 1 mois · Lomé</div>
                </div>
              </div>
            </div>
            <div className="card testimonial-card animate-on-scroll">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">« J&apos;ai suivi les cours de robotique et j&apos;ai pu construire mon propre assistant. Un suivi excellent et des résultats concrets. »</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">M</div>
                <div>
                  <div className="testimonial-name">Mawuli A.</div>
                  <div className="testimonial-meta">Il y a 3 semaines · Lomé</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Galerie Projets */}
      <section className="section" id="home-latest-media" style={{ background: 'rgba(0, 60, 87, 0.1)' }}>
        <div className="container">
          <h2 className="section-title">Galerie Projets & Électronique</h2>
          <div className="grid-4">
            {[
              { src: '/images/tutorial-photos/Arduino Bluetooth Car Building 🛠.webp', label: 'Arduino Robotique' },
              { src: '/images/tutorial-photos/technical-schematic-diagram-analog-electronic-260nw-2505467983.webp', label: 'Schémas Analogiques' },
              { src: '/images/tutorial-photos/transistor.webp', label: 'Transistor King' },
              { src: '/images/tutorial-photos/placeholder-3.webp', label: 'Projet Drone Nano' },
              { src: '/images/tutorial-photos/close-up-electronic-components.webp', label: 'Focus Composants' },
              { src: '/images/tutorial-photos/various-radio-components-soldering-iron-600nw-2695650513.webp', label: 'Atelier Soudure' },
              { src: '/images/tutorial-photos/78xx Regulators.webp', label: 'Régulateurs 78xx' },
              { src: '/images/tutorial-photos/LED DISTANCE INDICATOR.webp', label: 'Indicateur LED' },
              { src: '/images/tutorial-photos/top-view-wires-tech-background.webp', label: 'Câblage Précis' },
              { src: '/images/tutorial-photos/Arduino vs ESP8266 vs ESP32 Microcontroller Comparison - DIYI0T.webp', label: 'Comparaison MCU' },
              { src: '/images/tutorial-photos/Régulateur de tension LM317 _ montages - Astuces Pratiques.webp', label: 'Montage LM317' },
              { src: '/images/tutorial-photos/top-view-diverse-group-people-600nw-2757624093.webp', label: 'Notre Communauté' },
            ].map((img, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: 220 }}>
                  <Image src={img.src} alt={img.label} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 25vw" />
                </div>
                <div style={{ padding: '0.75rem' }}>
                  <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--clr-muted)' }}>{img.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Newsletter */}
      <section className="section">
        <div className="container">
          <div className="newsletter-section animate-on-scroll">
            <h2>Restez informé</h2>
            <p>Recevez les nouveaux tutoriels et offres de la boutique directement dans votre boîte mail.</p>
            <NewsletterForm buttonText="S'inscrire" />
          </div>
        </div>
      </section>

      {/* 9. CTA final */}
      <section className="section">
        <div className="container">
          <div className="cta-section animate-on-scroll hover-lift">
            <h2>Prêt à apprendre ?</h2>
            <p>Rejoignez notre communauté et commencez à explorer le monde de l&apos;électronique et de l&apos;informatique.</p>
            <Link href="/tutorials" className="btn btn-primary ripple">Commencer maintenant</Link>
          </div>
        </div>
      </section>
    </>
  );
}
