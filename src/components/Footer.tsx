'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const pathname = usePathname();
  const isAccountPage = pathname === '/account';

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-brand"><span>Tech</span>-geo</div>
            <p className="footer-desc">Plateforme d'apprentissage en électronique et informatique. Cours, tutoriels, et boutique de composants.</p>
            {!user ? (
              !isAccountPage && (
                <>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <Link href="/account" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>Se connecter</Link>
                    <Link href="/account" className="btn" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>S&apos;inscrire</Link>
                  </div>
                  <div className="newsletter-mini" style={{ marginTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--clr-muted)', marginBottom: '0.5rem' }}>Abonnez-vous à la newsletter</p>
                    <form className="newsletter-form" style={{ display: 'flex', gap: '0.25rem' }}>
                      <input 
                        type="email" 
                        placeholder="Votre email..." 
                        required 
                        style={{ 
                          flex: 1, 
                          background: 'rgba(255,255,255,0.05)', 
                          border: '1px solid var(--clr-border)', 
                          borderRadius: '4px',
                          padding: '0.4rem 0.75rem',
                          fontSize: '0.8rem',
                          color: '#fff'
                        }} 
                      />
                      <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>OK</button>
                    </form>
                  </div>
                </>
              )
            ) : (
              <div style={{ marginTop: '0.75rem' }}>
                <p style={{ color: 'var(--clr-accent)', fontSize: '0.85rem' }}>👋 Connecté : {user.email}</p>
                <div className="newsletter-mini" style={{ marginTop: '1rem' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--clr-muted)', marginBottom: '0.5rem' }}>Recevez nos nouveautés</p>
                  <form className="newsletter-form" style={{ display: 'flex', gap: '0.25rem' }}>
                    <input 
                      type="email" 
                      placeholder="Email..." 
                      defaultValue={user.email}
                      required 
                      style={{ 
                        flex: 1, 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid var(--clr-border)', 
                        borderRadius: '4px',
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.8rem',
                        color: '#fff'
                      }} 
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>S&apos;abonner</button>
                  </form>
                </div>
              </div>
            )}          </div>
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
              {isAdmin && <li><Link href="/admin" style={{ color: 'var(--clr-accent)', fontWeight: 'bold' }}>⚡ Administration</Link></li>}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><Link href="/contact">Formulaire de contact</Link></li>
              <li><a href="mailto:contact@tech-geo.com">contact@tech-geo.com</a></li>
            </ul>
            <div className="social-links-modern" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <a href="https://instagram.com" target="_blank" className="social-icon-box instagram" title="Instagram">
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram" />
              </a>
              <a href="https://facebook.com" target="_blank" className="social-icon-box facebook" title="Facebook">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_(2019).png" alt="Facebook" />
              </a>
              <a href="https://tiktok.com" target="_blank" className="social-icon-box tiktok" title="TikTok">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/34/Ionicons_logo-tiktok.svg" alt="TikTok" style={{ filter: 'invert(1)' }} />
              </a>
              <a href="https://whatsapp.com" target="_blank" className="social-icon-box whatsapp" title="WhatsApp">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
              </a>
              <a href="https://linkedin.com" target="_blank" className="social-icon-box linkedin" title="LinkedIn">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn" />
              </a>
              <a href="https://x.com" target="_blank" className="social-icon-box x" title="X (Twitter)">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/X_logo_2023_original.svg" alt="X" style={{ filter: 'invert(1)' }} />
              </a>
            </div>
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
