// Rate limiting côté client — limite les soumissions de formulaires
// Stocké en mémoire (reset au refresh, suffit pour anti-spam basique)

interface RateLimitEntry {
  count: number;
  firstAt: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Vérifie si l'action est autorisée.
 * @param key     Identifiant unique (ex: 'contact-form', 'site-form')
 * @param max     Nombre max de tentatives dans la fenêtre
 * @param windowMs Fenêtre en ms (défaut: 5 minutes)
 */
export function checkRateLimit(key: string, max = 3, windowMs = 5 * 60 * 1000): { ok: boolean; waitSeconds: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.firstAt > windowMs) {
    store.set(key, { count: 1, firstAt: now });
    return { ok: true, waitSeconds: 0 };
  }

  if (entry.count >= max) {
    const waitMs = windowMs - (now - entry.firstAt);
    return { ok: false, waitSeconds: Math.ceil(waitMs / 1000) };
  }

  entry.count++;
  return { ok: true, waitSeconds: 0 };
}
