'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';

export default function Header({ onSearchOpen, onCartOpen }: { onSearchOpen: () => void; onCartOpen: () => void }) {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const { isDark, toggle } = useTheme();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path: string) => pathname === path ? 'active' : '';

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/tutorials', label: 'Tutoriels' },
    { href: '/boutique', label: 'Boutique' },
    { href: '/software', label: 'Logiciels' },
    {href: '/api', label: 'API'},
    {href: '/business', label: 'Business'},
    {href: '/steam', label: 'Steam'},
    {href: '/steam/games', label: 'Jeux'},
    {href: '/about', label: 'À propos'},
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
            <Link href="/wishlist" className="wishlist-link" aria-label="Favoris">
              <span>&#9825;</span>
            </Link>
            <button className="search-toggle" aria-label="Rechercher" title="Ctrl+K" onClick={onSearchOpen}>
              &#128269;
            </button>
            <button className="theme-toggle" aria-label="Basculer le thème" onClick={toggle}>
              <span className="theme-toggle-icon moon" style={{ display: isDark ? 'none' : 'inline' }}>&#9789;</span>
              <span className="theme-toggle-icon sun" style={{ display: isDark ? 'inline' : 'none' }}>&#9788;</span>
            </button>
            <div id="auth-container" className="auth-nav-item">
              {user ? (
                <div className="user-menu">
                  <button className="user-menu-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <span className="user-avatar-sm">{user.email?.charAt(0).toUpperCase()}</span>
                    <span className="user-menu-name">{user.user_metadata?.name || user.email?.split('@')[0]}</span>
                  </button>
                  {dropdownOpen && (
                    <div className="user-dropdown show">
                      <div className="user-dropdown-header">
                        <div className="user-name">{user.user_metadata?.name || user.email}</div>
                        <div className="user-role">{profile?.role || 'client'}</div>
                      </div>
                      <Link href="/account">Mon compte</Link>
                      <Link href="/account?tab=orders">Mes commandes</Link>
                      <Link href="/wishlist">Mes favoris</Link>
                      <div className="dropdown-divider"></div>
                      <button className="logout-btn" onClick={signOut}>Déconnexion</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/account" className="btn btn-outline btn-sm" title="Connexion" style={{ padding: '0.5rem', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span>👤</span>
                </Link>
              )}
            </div>
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
        <Link href="/account" className="btn btn-primary" style={{ margin: '0 1.5rem', justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>
          {user ? 'Mon Compte' : '👤 Connexion'}
        </Link>
      </nav>
    </>
  );
}
