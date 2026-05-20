import type { Metadata, Viewport } from 'next';
import './globals.css';
import ClientLayout from './client-layout';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  metadataBase: new URL('https://tech-geo.vercel.app'),
  title: 'Tech‑Geo — Électronique & Informatique',
  description: 'Formation en électronique et informatique. Cours, tutoriels, et boutique en ligne.',
  manifest: '/images/Logo/site.webmanifest',
  icons: {
    icon: [
      { url: '/images/Logo/favicon.ico' },
      { url: '/images/Logo/favicon-16x16.webp', sizes: '16x16', type: 'image/png' },
      { url: '/images/Logo/favicon-32x32.webp', sizes: '32x32', type: 'image/png' },
      { url: '/images/Logo/favicon-48x48.webp', sizes: '48x48', type: 'image/png' },
      { url: '/images/Logo/favicon-96x96.webp', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/images/Logo/apple-touch-icon.webp', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/images/Logo/mstile-150x150.webp', color: '#1a5fb4' },
    ],
  },
  other: {
    'msapplication-TileColor': '#1a5fb4',
    'msapplication-TileImage': '/images/Logo/mstile-150x150.webp',
  },
  openGraph: {
    title: 'Tech‑Geo — Électronique & Informatique',
    description: 'Apprenez l\'électronique et l\'informatique avec des cours interactifs.',
    url: 'https://tech-geo.vercel.app',
    siteName: 'Tech-Geo',
    locale: 'fr_FR',
    type: 'website',
    images: [{ url: '/images/og-image.svg' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#1a5fb4',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* Preconnect pour accélérer les ressources critiques */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        <link rel="dns-prefetch" href="https://translate.googleapis.com" />
        <meta name="theme-color" content="#051c24" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": "https://tech-geo.vercel.app/#website",
                "name": "Tech-Geo",
                "url": "https://tech-geo.vercel.app",
                "description": "Formation en électronique et informatique au Togo",
                "inLanguage": "fr-FR",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://tech-geo.vercel.app/boutique?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@type": "Organization",
                "@id": "https://tech-geo.vercel.app/#organization",
                "name": "Tech-Geo",
                "url": "https://tech-geo.vercel.app",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://tech-geo.vercel.app/images/Logo/logo.webp",
                  "width": 512,
                  "height": 512
                },
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "availableLanguage": "French",
                  "areaServed": "TG"
                },
                "sameAs": ["https://tech-geo.vercel.app"]
              },
              {
                "@type": "OnlineStore",
                "@id": "https://tech-geo.vercel.app/#store",
                "name": "Tech-Geo Boutique",
                "url": "https://tech-geo.vercel.app/boutique",
                "description": "Matériel électronique, composants et accessoires informatiques",
                "currenciesAccepted": "XOF",
                "priceRange": "₣₣",
                "areaServed": {
                  "@type": "Country",
                  "name": "Togo"
                }
              }
            ]
          })
        }} />
      </head>
      <body className="page-transition">
        <ErrorBoundary><ClientLayout>{children}</ClientLayout></ErrorBoundary>
      </body>
    </html>
  );
}
