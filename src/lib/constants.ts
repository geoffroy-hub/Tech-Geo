export const SUPABASE_TABLES = {
  products: 'products',
  tutorials: 'tutorials',
  media: 'media',
  siteSettings: 'site_settings',
  contacts: 'contact_messages',
  orders: 'orders',
  profiles: 'profiles',
  wishlist: 'wishlist',
  reviews: 'reviews',
} as const;

export const SITE_NAME = 'Tech‑Geo';
export const SITE_DESCRIPTION = 'Formation en électronique et informatique. Cours, tutoriels, et boutique en ligne.';
export const SITE_URL = 'https://tech-geo.vercel.app';
export const DEFAULT_CURRENCY = 'FCFA';
export const CACHE_TTL = 5 * 60 * 1000;
