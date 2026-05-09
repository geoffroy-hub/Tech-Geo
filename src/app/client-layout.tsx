'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import SearchOverlay from '@/components/SearchOverlay';
import AuthModal from '@/components/AuthModal';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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

  // Page admin ou compte : aucun header/footer/nav
  if (pathname?.startsWith('/admin') || pathname === '/account') {
    return <>{children}</>;
  }

  return (
    <>
      <Header onSearchOpen={openSearch} onCartOpen={openCart} />
      <SearchOverlay isOpen={searchOpen} onClose={closeSearch} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <CartSidebar />
      <main>{children}</main>
      <Footer />

    </>
  );
}
