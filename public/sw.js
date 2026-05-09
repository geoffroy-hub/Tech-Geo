/* ===================================================
   Tech‑geo — Service Worker (PWA)
   =================================================== */

const CACHE_NAME = 'techgeo-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/tutorials.html',
  '/boutique.html',
  '/about.html',
  '/contact.html',
  '/terms.html',
  '/privacy.html',
  '/nonne/steam.html',
  '/css/styles.css',
  '/css/layout.css',
  '/css/home.css',
  '/css/boutique.css',
  '/css/contact.css',
  '/css/tutorials.css',
  '/css/about.css',
  '/css/admin.css',
  '/css/steam.css',
  '/css/legal.css',
  '/css/404.css',
  '/css/dark-mode.css',
  '/css/animations.css',
  '/css/search.css',
  '/css/mobile-nav.css',
  '/css/features.css',
  '/js/gol.js',
  '/js/supabase.js',
  '/js/main.js',
  '/js/admin.js',
  '/js/cart.js',
  '/js/media.js',
  '/js/dark-mode.js',
  '/js/search.js',
  '/js/wishlist.js',
  '/js/swipe.js',
  '/js/ratings.js',
  '/js/newsletter.js',
];

// Install — cache static assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
