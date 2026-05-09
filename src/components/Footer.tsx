import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-brand"><span>Tech</span>-geo</div>
            <p className="footer-desc">Plateforme d'apprentissage en électronique et informatique. Cours, tutoriels, et boutique de composants.</p>
          </div>
          <div className="footer-col">
            <h4>Navigation</h4>
            <ul>
              <li><Link href="/">Accueil</Link></li>
              <li><Link href="/tutorials">Tutoriels</Link></li>
              <li><Link href="/boutique">Boutique</Link></li>
              <li><Link href="/steam">Steam Lab</Link></li>
              <li><Link href="/steam/games">Jeux</Link></li>
              <li><Link href="/about">À propos</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/wishlist">Favoris</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Légal</h4>
            <ul>
              <li><Link href="/terms">Conditions d'utilisation</Link></li>
              <li><Link href="/privacy">Politique de confidentialité</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><Link href="/contact">Formulaire de contact</Link></li>
              <li><a href="mailto:contact@tech-geo.com">contact@tech-geo.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Tech-Geo. Tous droits réservés.</p>
          <p>
            <Link href="/terms">Conditions</Link>
            <Link href="/privacy">Confidentialité</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
