import type { Metadata, Viewport } from 'next';
import './globals.css';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: 'Tech‑Geo — Électronique & Informatique',
  description: 'Formation en électronique et informatique. Cours, tutoriels, et boutique en ligne.',
  manifest: '/manifest.json',
  icons: { icon: '/images/favicon.svg' },
  openGraph: {
    title: 'Tech‑Geo — Électronique & Informatique',
    description: 'Apprenez l\'électronique et l\'informatique avec des cours interactifs.',
    url: 'https://tech-geo.com',
    siteName: 'Tech-Geo',
    locale: 'fr_FR',
    type: 'website',
    images: [{ url: '/images/og-image.svg' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#051C24',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Tech-Geo",
            "url": "https://tech-geo.com",
            "description": "Plateforme d'apprentissage en électronique et informatique",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://tech-geo.com?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }} />
      </head>
      <body className="page-transition">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
