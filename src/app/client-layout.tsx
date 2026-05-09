'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import SearchOverlay from '@/components/SearchOverlay';
import AuthModal from '@/components/AuthModal';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const openCart = useCallback(() => setCartOpen(true), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        router.push('/admin');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [router]);

  return (
    <>
      <Header onSearchOpen={openSearch} onCartOpen={openCart} />
      <SearchOverlay isOpen={searchOpen} onClose={closeSearch} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <CartSidebar />
      <main>{children}</main>
      <Footer />

      <nav className="mobile-bottom-nav" aria-label="Navigation mobile">
        <div className="bottom-nav-items">
          <a href="/" className="bottom-nav-item active">
            <span className="icon">🏠</span> Accueil
          </a>
          <a href="/tutorials" className="bottom-nav-item">
            <span className="icon">📚</span> Cours
          </a>
          <a href="/boutique" className="bottom-nav-item">
            <span className="icon">🛒</span> Boutique
          </a>
          <a href="/steam" className="bottom-nav-item">
            <span className="icon">🎮</span> Steam
          </a>
          <a href="/wishlist" className="bottom-nav-item">
            <span className="icon">♡</span> Wishlist
          </a>
          <a href="/about" className="bottom-nav-item">
            <span className="icon">ℹ️</span> À propos
          </a>
        </div>
      </nav>
    </>
  );
}
