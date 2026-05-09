import type { Metadata, Viewport } from 'next';
import './globals.css';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: 'Tech‑Geo — Électronique & Informatique',
  description: 'Formation en électronique et informatique. Cours, tutoriels, et boutique en ligne.',
  manifest: '/images/Logo/site.webmanifest',
  icons: {
    icon: [
      { url: '/images/Logo/favicon.ico' },
      { url: '/images/Logo/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/Logo/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/Logo/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/images/Logo/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/images/Logo/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/images/Logo/mstile-150x150.png', color: '#1a5fb4' },
    ],
  },
  other: {
    'msapplication-TileColor': '#1a5fb4',
    'msapplication-TileImage': '/images/Logo/mstile-150x150.png',
  },
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
  themeColor: '#1a5fb4',
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
