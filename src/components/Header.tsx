'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

// --- Composant LangSwitcher toggle FR ↔ EN ---
function LangSwitcher() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  useEffect(() => {
    const c = document.cookie.split('; ').find(r => r.startsWith('googtrans='));
    setLang(c && c.includes('/fr/en') ? 'en' : 'fr');

    if (!document.getElementById('google-translate-script')) {
      (window as any).googleTranslateElementInit = () => {
        try {
          new (window as any).google.translate.TranslateElement(
            { pageLanguage: 'fr', includedLanguages: 'en,fr', autoDisplay: false },
            'google_translate_element_hidden'
          );
        } catch (_) {}
      };
      const s = document.createElement('script');
      s.id = 'google-translate-script';
      s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      s.async = true;
      document.head.appendChild(s);
    }
  }, []);

  const toggle = () => {
    const next = lang === 'fr' ? 'en' : 'fr';
    const host = window.location.hostname;
    if (next === 'fr') {
      document.cookie = `googtrans=; path=/; domain=${host}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
      document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    } else {
      document.cookie = `googtrans=/fr/en; path=/; domain=${host}`;
      document.cookie = `googtrans=/fr/en; path=/`;
    }
    setLang(next);
    window.location.reload();
  };

  return (
    <button className="pill-lang-toggle" onClick={toggle} title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}>
      {lang === 'fr' ? 'FR' : 'EN'}
    </button>
  );
}
// ---

export default function Header({ onSearchOpen, onAuthOpen }: { onSearchOpen: () => void; onAuthOpen?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { isDark, toggle } = useTheme();
  const { items, totalItems, totalPrice, removeItem, updateQuantity } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) setShowCart(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (path: string) => pathname === path ? 'active' : '';

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/tutorials', label: 'Tutoriels' },
    { href: '/steam', label: 'Steam' },
    { href: '/steam/games', label: 'Jeux' },
    { href: '/blog', label: 'Blog' },
    { href: '/boutique', label: 'Boutique' },
    { href: '/software', label: 'Logiciels' },
    { href: '/site', label: 'Site Web' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/api', label: 'API' },
    { href: '/business', label: 'Business' },
    { href: '/faq', label: 'FAQ' },
    { href: '/about', label: 'À propos' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="logo">
            <span>Tech</span>-Geo
          </Link>

          <nav className="main-nav" aria-label="Navigation principale">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className={isActive(link.href)}>
                {link.label}
              </Link>
            ))}
            <div className={`lang-theme-pill${!isDark ? ' light' : ''}`}>
              <div id="google_translate_element_hidden" style={{ display: 'none', position: 'absolute', pointerEvents: 'none', visibility: 'hidden' }} aria-hidden="true" />
              <LangSwitcher />
              <span className="pill-sep" aria-hidden="true">v</span>
              <button className="pill-theme-btn" aria-label="Basculer le thème" onClick={(e) => toggle(e)}>
                {isDark ? '🌙' : '☀️'}
              </button>
            </div>
            <div id="auth-container" className="auth-nav-item">
              {user ? (
                <div className="user-menu">
                  <button className="user-menu-btn" onClick={() => setDropdownOpen(!dropdownOpen)} style={{ padding: '0.25rem', borderRadius: '50%', border: '2px solid transparent', background: 'transparent' }}>
                    <span className="user-avatar-sm" style={{ margin: 0, width: '36px', height: '36px', fontSize: '1rem' }}>{user.email?.charAt(0).toUpperCase()}</span>
                  </button>
                  {dropdownOpen && (
                    <div className="user-dropdown show">
                      <div className="user-dropdown-header">
                        <div className="user-name">{user.user_metadata?.name || user.email}</div>
                        <div className="user-role">{profile?.role || 'client'}</div>
                      </div>
                      <Link href="/account">Mon compte</Link>
                      <Link href="/account?tab=orders">Mes commandes</Link>
                      <Link href="/suivi-commande">Suivi de commande</Link>
                      <Link href="/wishlist">Mes favoris</Link>
                      <div className="dropdown-divider"></div>
                      <button className="logout-btn" onClick={signOut}>Déconnexion</button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={onAuthOpen} className="btn btn-outline btn-sm" title="Connexion" style={{ padding: '0.5rem', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'transparent', border: '1px solid var(--clr-accent)' }}>
                  <span>👤</span>
                </button>
              )}
            </div>
            {totalItems > 0 && (
              <div ref={cartRef} style={{ position: 'relative', display: 'inline-flex' }}>
                <button aria-label="Panier" onClick={() => setShowCart(!showCart)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', position: 'relative', padding: '0.25rem 0.5rem' }}>
                  <span>🛒</span>
                  <span style={{ position: 'absolute', top: '-3px', right: '2px', background: 'var(--clr-accent)', color: '#000', fontSize: '0.7rem', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{totalItems}</span>
                </button>
                {showCart && items.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, width: 340, background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 9999, overflow: 'hidden' }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--clr-border)', fontWeight: 600, fontSize: '0.95rem' }}>
                      Votre panier ({totalItems} article{totalItems > 1 ? 's' : ''})
                    </div>
                    <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                      {items.map(item => (
                        <div key={item.product_id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--clr-muted)' }}>{item.price.toLocaleString('fr-FR')} FCFA</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} style={{ width: 26, height: 26, borderRadius: '4px', border: '1px solid var(--clr-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', lineHeight: 1 }}>−</button>
                            <span style={{ fontSize: '0.85rem', minWidth: 22, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} style={{ width: 26, height: 26, borderRadius: '4px', border: '1px solid var(--clr-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', lineHeight: 1 }}>+</button>
                          </div>
                          <button onClick={() => removeItem(item.product_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4757', fontSize: '1rem', padding: '0.2rem', lineHeight: 1 }}>&times;</button>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderTop: '1px solid var(--clr-border)' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Total: {totalPrice.toLocaleString('fr-FR')} FCFA</span>
                      <button className="btn btn-primary btn-sm" onClick={() => { setShowCart(false); router.push('/checkout'); }} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                        Commander
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          <button className="hamburger" aria-label="Menu" onClick={() => setMobileOpen(!mobileOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      {mobileOpen && <div className="nav-overlay active" onClick={() => setMobileOpen(false)}></div>}
      <nav className={`mobile-nav ${mobileOpen ? 'open' : ''}`} aria-label="Navigation mobile">
        {navLinks.map(link => (
          <Link key={link.href} href={link.href} className={isActive(link.href)} onClick={() => setMobileOpen(false)}>
            {link.label}
          </Link>
        ))}
        <div className="mobile-nav-divider" style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1rem 0' }}></div>
        <div style={{ padding: '0 1.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.55 }}>Thème & Langue</span>
          <div className={`lang-theme-pill mobile-pill${!isDark ? ' light' : ''}`}>
            <LangSwitcher />
            <span className="pill-sep" aria-hidden="true">v</span>
            <button className="pill-theme-btn" aria-label="Basculer le thème" onClick={(e) => toggle(e)}>
              {isDark ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
        <Link href="/account" className="btn btn-primary" style={{ margin: '0 1.5rem', justifyContent: 'center' }} onClick={() => { setMobileOpen(false); if (!user && onAuthOpen) onAuthOpen(); }}>
          {user ? 'Mon Compte' : '👤 Connexion'}
        </Link>
      </nav>
    </>
  );
}
