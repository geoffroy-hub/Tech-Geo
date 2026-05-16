'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CartProvider } from '@/hooks/useCart';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import PushNotifications from '@/components/PushNotifications';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authOpen, setAuthOpen] = useState(false);

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
    <CartProvider>
      <Header onSearchOpen={() => {}} onAuthOpen={() => setAuthOpen(true)} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <main>{children}</main>
      <Footer />
      <PushNotifications />
    </CartProvider>
  );
}
