'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { getSupabase } from '@/lib/supabase';
import type { Product } from '@/types';

// ── Config ordinateurs : options stockage + cores ──────────────────────────
const PC_OPTIONS: Record<string, { storage: { label: string; extra: number }[]; cores: { label: string; extra: number }[] }> = {
  default: {
    storage: [
      { label: '256 Go SSD', extra: 0 },
      { label: '512 Go SSD', extra: 10000 },
      { label: '1 To SSD',   extra: 20000 },
      { label: '256 Go HDD', extra: -5000 },
      { label: '500 Go HDD', extra: 0 },
      { label: '1 To HDD',   extra: 8000 },
    ],
    cores: [
      { label: 'Intel Core i3', extra: -15000 },
      { label: 'Intel Core i5', extra: 0 },
      { label: 'Intel Core i7', extra: 20000 },
      { label: 'AMD Ryzen 5',   extra: 0 },
      { label: 'AMD Ryzen 7',   extra: 18000 },
    ],
  },
};

const FIXED_PRODUCTS: Product[] = [
  { id: 'prod-vo1', name: 'Tech-Geo VO1', price: 35000, category: 'microcontrôleurs', image_url: '/images/products/VO1.webp', description: 'Contrôleur intelligent VO1 haute performance pour projets IoT et domotique avancés.', rating: 5.0, stock: 10, available: true, created_at: new Date().toISOString() },
  { id: 'prod-vo2', name: 'Arduino Uno R3', price: 15000, category: 'microcontrôleurs', image_url: '/images/products/arduino-uno-r3.webp', description: 'Carte de développement Arduino Uno R3 officielle.', rating: 4.8, stock: 15, available: true, created_at: new Date().toISOString() },
  { id: 'prod-1', name: 'Résistance 1kΩ (x10)', price: 500, category: 'composants', image_url: '/images/products/resistances-kit.webp', description: 'Lot de 10 résistances 1kΩ 1/4W.', rating: 4.5, stock: 100, available: true, created_at: new Date().toISOString() },
  { id: 'prod-2', name: 'LED 5mm (x10)', price: 1000, category: 'composants', image_url: '/images/products/leds-kit.webp', description: 'Lot de 10 LED 5mm de couleur assorties.', rating: 4.7, stock: 50, available: true, created_at: new Date().toISOString() },
  { id: 'prod-3', name: 'Kit Soudure', price: 8500, category: 'outils', image_url: '/images/products/kit-soudure.webp', description: 'Kit de soudure complet avec fer à souder, étain et pompe.', rating: 4.3, stock: 8, available: true, created_at: new Date().toISOString() },
  { id: 'prod-fer', name: 'Fer à Souder', price: 2500, category: 'outils', image_url: '/images/products/fer-a-souder.webp', description: 'Fer à souder professionnel pour vos projets électroniques.', rating: 4.5, stock: 20, available: true, created_at: new Date().toISOString() },
  { id: 'prod-dell-3310', name: 'Dell Latitude 3310', price: 130000, category: 'ordinateurs', image_url: '/images/products/ordinateurs/3310.webp', description: 'Dell Latitude 3310 – Portable entrée de gamme, idéal pour la bureautique.', rating: 4.3, stock: 3, available: true, created_at: new Date().toISOString() },
  { id: 'prod-dell-3410', name: 'Dell Latitude 3410', price: 145000, category: 'ordinateurs', image_url: '/images/products/ordinateurs/3410.webp', description: 'Dell Latitude 3410 – Performances solides pour un usage quotidien.', rating: 4.4, stock: 3, available: true, created_at: new Date().toISOString() },
  { id: 'prod-dell-3510', name: 'Dell Latitude 3510', price: 150000, category: 'ordinateurs', image_url: '/images/products/ordinateurs/3510.webp', description: 'Dell Latitude 3510 – Écran 15.6", parfait pour le multitâche.', rating: 4.3, stock: 2, available: true, created_at: new Date().toISOString() },
  { id: 'prod-dell-5300', name: 'Dell Latitude 5300', price: 165000, category: 'ordinateurs', image_url: '/images/products/ordinateurs/5300.webp', description: 'Dell Latitude 5300 – 13" compact et léger, Intel Core i5, SSD 256Go.', rating: 4.5, stock: 3, available: true, created_at: new Date().toISOString() },
  { id: 'prod-dell-5400', name: 'Dell Latitude 5400', price: 170000, category: 'ordinateurs', image_url: '/images/products/ordinateurs/5400.webp', description: 'Dell Latitude 5400 – 14" Intel Core i5/i7, robuste et fiable pour le bureau.', rating: 4.5, stock: 3, available: true, created_at: new Date().toISOString() },
  { id: 'prod-dell-7280', name: 'Dell Latitude 7280', price: 200000, category: 'ordinateurs', image_url: '/images/products/ordinateurs/7280.webp', description: 'Dell Latitude 7280 – 12.5" ultraportable business, Intel Core i7, léger et puissant.', rating: 4.6, stock: 2, available: true, created_at: new Date().toISOString() },
  { id: 'prod-dell-5430', name: 'Dell Latitude 5430', price: 175000, category: 'ordinateurs', image_url: '/images/products/ordinateurs/5430.webp', description: 'Dell Latitude 5430 – La référence professionnelle en 14".', rating: 4.6, stock: 4, available: true, created_at: new Date().toISOString() },
  { id: 'prod-dell-5440', name: 'Dell Latitude 5440', price: 195000, category: 'ordinateurs', image_url: '/images/products/ordinateurs/5440.webp', description: 'Dell Latitude 5440 – Dernière génération Intel Core, SSD rapide.', rating: 4.7, stock: 3, available: true, created_at: new Date().toISOString() },
  { id: 'prod-dell-5490', name: 'Dell Latitude 5490', price: 185000, category: 'ordinateurs', image_url: '/images/products/ordinateurs/5490.webp', description: 'Dell Latitude 5490 – Fiable et robuste pour les environnements exigeants.', rating: 4.5, stock: 3, available: true, created_at: new Date().toISOString() },
  { id: 'prod-dell-7320', name: 'Dell Latitude 7320', price: 250000, category: 'ordinateurs', image_url: '/images/products/ordinateurs/7320.webp', description: 'Dell Latitude 7320 – Ultrabook premium 13" léger et puissant.', rating: 4.8, stock: 2, available: true, created_at: new Date().toISOString() },
  { id: 'prod-dell-7340', name: 'Dell Latitude 7340', price: 280000, category: 'ordinateurs', image_url: '/images/products/ordinateurs/7340.webp', description: 'Dell Latitude 7340 – Haut de gamme, design élégant, autonomie longue durée.', rating: 4.9, stock: 2, available: true, created_at: new Date().toISOString() },
  { id: 'prod-dell-7440', name: 'Dell Latitude 7440', price: 300000, category: 'ordinateurs', image_url: '/images/products/ordinateurs/7440.webp', description: 'Dell Latitude 7440 – Le meilleur rapport qualité/prix en 14" professionnel.', rating: 4.8, stock: 2, available: true, created_at: new Date().toISOString() },
  { id: 'prod-dell-7540', name: 'Dell Latitude 7540', price: 280000, category: 'ordinateurs', image_url: '/images/products/ordinateurs/7540.webp', description: 'Dell Latitude 7540 – Station de travail portable 15.6" performante.', rating: 4.7, stock: 2, available: true, created_at: new Date().toISOString() },
  { id: 'prod-etain', name: 'Étain', price: 4000, category: 'outils', image_url: '/images/products/etain.webp', description: 'Fil d\'étain de haute qualité pour soudure électronique.', rating: 4.5, stock: 30, available: true, created_at: new Date().toISOString() },
  { id: 'prod-ins-3515', name: 'Dell Inspiron 3515', price: 160000, category: 'ordinateurs', image_url: '/images/products/placeholder.webp', description: 'Dell Inspiron 3515 – AMD Ryzen 5, 8Go RAM, SSD 256Go. Idéal étudiant.', rating: 4.4, stock: 3, available: true, created_at: new Date().toISOString() },
  { id: 'prod-ins-3520', name: 'Dell Inspiron 3520', price: 180000, category: 'ordinateurs', image_url: '/images/products/placeholder.webp', description: 'Dell Inspiron 3520 – Intel Core i5, 8Go RAM, SSD 512Go. Performant.', rating: 4.5, stock: 3, available: true, created_at: new Date().toISOString() },
  { id: 'prod-ins-5410', name: 'Dell Inspiron 5410', price: 220000, category: 'ordinateurs', image_url: '/images/products/ordinateurs/INS5410.webp', description: 'Dell Inspiron 5410 – 14" tactile, Intel Core i7, SSD 512Go.', rating: 4.6, stock: 2, available: true, created_at: new Date().toISOString() },
  { id: 'prod-ins-5510', name: 'Dell Inspiron 5510', price: 210000, category: 'ordinateurs', image_url: '/images/products/ordinateurs/INS5510.webp', description: 'Dell Inspiron 5510 – 15.6" Intel Core i7, SSD 512Go, design fin.', rating: 4.5, stock: 2, available: true, created_at: new Date().toISOString() },
  { id: 'prod-ins-7440', name: 'Dell Inspiron 7440', price: 290000, category: 'ordinateurs', image_url: '/images/products/ordinateurs/INS7440.webp', description: 'Dell Inspiron 7440 – 14" Intel Core i7, 16Go RAM, SSD 512Go. Design premium.', rating: 4.8, stock: 2, available: true, created_at: new Date().toISOString() },
  { id: 'prod-ins-7540', name: 'Dell Inspiron 7540', price: 310000, category: 'ordinateurs', image_url: '/images/products/ordinateurs/INS7540.webp', description: 'Dell Inspiron 7540 – 15.6" Intel Core i7, 16Go RAM, SSD 1To. Haute performance.', rating: 4.8, stock: 2, available: true, created_at: new Date().toISOString() },
  { id: 'prod-ins-7510', name: 'Dell Inspiron 7510', price: 320000, category: 'ordinateurs', image_url: '/images/products/placeholder.webp', description: 'Dell Inspiron 7510 – 15.6" premium, Core i7, 16Go RAM, SSD 1To.', rating: 4.7, stock: 1, available: true, created_at: new Date().toISOString() },
  { id: 'prod-perchlorure-kg', name: 'Perchlorure de Fer 1kg (poudre)', price: 12000, category: 'outils', image_url: '/images/products/perchlorure-fer.webp', description: 'Perchlorure de fer en poudre — 1kg. Pour la gravure de circuits imprimés (PCB). Haute concentration.', rating: 4.8, stock: 15, available: true, created_at: new Date().toISOString() },
  { id: 'prod-perchlorure', name: 'Perchlorure de Fer', price: 120000, category: 'outils', image_url: '/images/products/perchlorure-fer.webp', description: 'Perchlorure de fer pour la gravure de circuits imprimés (PCB). Solution professionnelle.', rating: 4.7, stock: 20, available: true, created_at: new Date().toISOString() },
  { id: 'prod-hdd-500', name: 'Disque Dur HDD 500Go', price: 15000, category: 'accessoires', image_url: '/images/products/hdd-500.webp', description: 'Disque dur interne 500Go SATA III 7200tr/min.', rating: 4.3, stock: 15, available: true, created_at: new Date().toISOString() },
  { id: 'prod-hdd-1to', name: 'Disque Dur HDD 1To', price: 22000, category: 'accessoires', image_url: '/images/products/hdd-1to.webp', description: 'Disque dur interne 1To SATA III 7200tr/min. Stockage massif.', rating: 4.4, stock: 12, available: true, created_at: new Date().toISOString() },
  { id: 'prod-hdd-2to', name: 'Disque Dur HDD 2To', price: 35000, category: 'accessoires', image_url: '/images/products/hdd-2to.webp', description: 'Disque dur interne 2To SATA III. Idéal pour le stockage de fichiers.', rating: 4.5, stock: 8, available: true, created_at: new Date().toISOString() },
  { id: 'prod-ssd-120', name: 'SSD 120Go', price: 12000, category: 'accessoires', image_url: '/images/products/ssd-120.webp', description: 'SSD SATA III 120Go. Démarrage Windows en 10 secondes.', rating: 4.5, stock: 20, available: true, created_at: new Date().toISOString() },
  { id: 'prod-ssd-240', name: 'SSD 240Go', price: 18000, category: 'accessoires', image_url: '/images/products/ssd-240.webp', description: 'SSD SATA III 240Go. Vitesse de lecture jusqu\'à 550Mo/s.', rating: 4.6, stock: 20, available: true, created_at: new Date().toISOString() },
  { id: 'prod-ssd-480', name: 'SSD 480Go', price: 28000, category: 'accessoires', image_url: '/images/products/ssd-480.webp', description: 'SSD SATA III 480Go. Grande capacité et rapidité.', rating: 4.7, stock: 15, available: true, created_at: new Date().toISOString() },
  { id: 'prod-ssd-1to', name: 'SSD 1To', price: 45000, category: 'accessoires', image_url: '/images/products/ssd-1to.webp', description: 'SSD SATA III 1To. Stockage haute performance grande capacité.', rating: 4.8, stock: 10, available: true, created_at: new Date().toISOString() },
  { id: 'prod-nvme-256', name: 'SSD NVMe 256Go', price: 22000, category: 'accessoires', image_url: '/images/products/nvme-256.webp', description: 'SSD NVMe M.2 256Go. Vitesse jusqu\'à 3500Mo/s.', rating: 4.7, stock: 12, available: true, created_at: new Date().toISOString() },
  { id: 'prod-nvme-512', name: 'SSD NVMe 512Go', price: 35000, category: 'accessoires', image_url: '/images/products/nvme-512.webp', description: 'SSD NVMe M.2 512Go. Performances ultrarapides.', rating: 4.8, stock: 10, available: true, created_at: new Date().toISOString() },
  { id: 'prod-nvme-1to', name: 'SSD NVMe 1To', price: 55000, category: 'accessoires', image_url: '/images/products/nvme-1to.webp', description: 'SSD NVMe M.2 1To. Le meilleur du stockage SSD.', rating: 4.9, stock: 5, available: true, created_at: new Date().toISOString() },
];

const CATEGORIES = ['microcontrôleurs', 'composants', 'accessoires', 'outils', 'ordinateurs'];

// ── Fiche produit inline pour ordinateurs ──────────────────────────────────
function ProductDetail({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem } = useCart();
  const { addItem: addWishlist } = useWishlist();
  const opts = PC_OPTIONS['default'];
  const [selectedStorage, setSelectedStorage] = useState(0);
  const [selectedCore, setSelectedCore] = useState(1); // i5 par défaut
  const ref = useRef<HTMLDivElement>(null);

  const extraPrice = opts.storage[selectedStorage].extra + opts.cores[selectedCore].extra;
  const finalPrice = Number(product.price) + extraPrice;

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleAddToCart = () => {
    const config = `${opts.cores[selectedCore].label} — ${opts.storage[selectedStorage].label}`;
    addItem({
      product_id: product.id,
      name: `${product.name} (${config})`,
      price: finalPrice,
      quantity: 1,
      image: product.image_url,
    });
  };

  return (
    <div ref={ref} className="product-detail-inline" style={{
      gridColumn: '1 / -1',
      background: 'var(--clr-surface)',
      border: '2px solid var(--clr-accent)',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '1rem',
      position: 'relative',
      boxShadow: '0 0 40px rgba(4,187,255,0.15)',
    }}>
      {/* Bouton fermer */}
      <button onClick={onClose} style={{
        position: 'absolute', top: '1rem', right: '1rem',
        background: 'rgba(255,255,255,0.08)', border: 'none',
        borderRadius: '50%', width: '36px', height: '36px',
        color: 'var(--clr-muted)', fontSize: '1.1rem',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.color = 'var(--clr-text)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = 'var(--clr-muted)'; }}
      >✕</button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '2rem', alignItems: 'start' }}>
        {/* Image */}
        <div style={{ borderRadius: '12px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', aspectRatio: '4/3' }}>
          <img
            src={product.image_url || '/images/products/placeholder.webp'}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }}
          />
        </div>

        {/* Infos */}
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{product.category}</span>
          <h2 style={{ fontSize: '1.5rem', margin: '0.25rem 0 0.5rem' }}>{product.name}</h2>

          {/* Étoiles */}
          {product.rating != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <span style={{ color: '#f0c040' }}>{'★'.repeat(Math.round(product.rating))}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--clr-muted)' }}>({product.rating})</span>
            </div>
          )}

          <p style={{ color: 'var(--clr-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{product.description}</p>

          {/* ── Sélection Processeur ── */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.6rem', color: 'var(--clr-accent)' }}>
              🔧 Processeur
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {opts.cores.map((c, i) => (
                <button key={i} onClick={() => setSelectedCore(i)} style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '6px',
                  border: `1px solid ${selectedCore === i ? 'var(--clr-accent)' : 'var(--clr-border)'}`,
                  background: selectedCore === i ? 'rgba(4,187,255,0.15)' : 'transparent',
                  color: selectedCore === i ? 'var(--clr-accent)' : 'var(--clr-muted)',
                  fontSize: '0.82rem',
                  fontWeight: selectedCore === i ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                  {c.label}
                  {c.extra !== 0 && (
                    <span style={{ fontSize: '0.72rem', marginLeft: '0.3rem', opacity: 0.8 }}>
                      {c.extra > 0 ? `+${c.extra.toLocaleString('fr-FR')}` : c.extra.toLocaleString('fr-FR')} F
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Sélection Stockage ── */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.6rem', color: 'var(--clr-accent)' }}>
              💾 Stockage
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {opts.storage.map((s, i) => (
                <button key={i} onClick={() => setSelectedStorage(i)} style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '6px',
                  border: `1px solid ${selectedStorage === i ? 'var(--clr-accent)' : 'var(--clr-border)'}`,
                  background: selectedStorage === i ? 'rgba(4,187,255,0.15)' : 'transparent',
                  color: selectedStorage === i ? 'var(--clr-accent)' : 'var(--clr-muted)',
                  fontSize: '0.82rem',
                  fontWeight: selectedStorage === i ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                  {s.label}
                  {s.extra !== 0 && (
                    <span style={{ fontSize: '0.72rem', marginLeft: '0.3rem', opacity: 0.8 }}>
                      {s.extra > 0 ? `+${s.extra.toLocaleString('fr-FR')}` : s.extra.toLocaleString('fr-FR')} F
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Prix final ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(4,187,255,0.07)', border: '1px solid rgba(4,187,255,0.2)',
            borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1rem',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--clr-muted)', marginBottom: '0.2rem' }}>Prix total configuré</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--clr-accent)', lineHeight: 1 }}>
                {finalPrice.toLocaleString('fr-FR')} <span style={{ fontSize: '1rem', fontWeight: 400 }}>FCFA</span>
              </div>
              {extraPrice !== 0 && (
                <div style={{ fontSize: '0.75rem', color: extraPrice > 0 ? '#f0c040' : '#4caf50', marginTop: '0.2rem' }}>
                  {extraPrice > 0 ? `+${extraPrice.toLocaleString('fr-FR')} F d'options` : `${Math.abs(extraPrice).toLocaleString('fr-FR')} F d'économie`}
                </div>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--clr-muted)', textAlign: 'right' }}>
              <div>Stock : <strong style={{ color: product.stock > 0 ? '#4caf50' : '#ff4757' }}>{product.stock > 0 ? `${product.stock} dispo` : 'Épuisé'}</strong></div>
            </div>
          </div>

          {/* ── Boutons ── */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.95rem' }}
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              🛒 Ajouter au panier
            </button>
            <button
              onClick={() => addWishlist(product.id)}
              style={{
                padding: '0.75rem 1rem', border: '1px solid var(--clr-border)',
                borderRadius: '8px', background: 'transparent',
                color: 'var(--clr-muted)', cursor: 'pointer', fontSize: '1.1rem',
                transition: 'all 0.2s',
              }}
              title="Ajouter aux favoris"
            >♡</button>
          </div>
        </div>
      </div>

      {/* Responsive mobile */}
      <style>{`
        @media (max-width: 640px) {
          .product-detail-inline > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────
export default function BoutiquePage() {
  const { addItem } = useCart();
  const { addItem: addWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>(FIXED_PRODUCTS);
  const [syncing, setSyncing] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('default');
  const [maxPrice, setMaxPrice] = useState(100000);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [insertAfterIndex, setInsertAfterIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadProducts() {
      setError('');
      try {
        const supabase = getSupabase();
        const { data, error: err } = await supabase
          .from('products')
          .select('*')
          .eq('available', true)
          .order('created_at', { ascending: false });
        if (err) {
          setError('Impossible de charger les produits.');
        } else if (data) {
          const existingIds = new Set(FIXED_PRODUCTS.map(p => p.id));
          const dbProducts = data.filter(p => !existingIds.has(p.id)) as Product[];
          setProducts([...FIXED_PRODUCTS, ...dbProducts]);
        }
      } catch {
        setError('Impossible de charger les produits.');
      }
      setSyncing(false);
    }
    loadProducts();
  }, []);

  let filtered = [...products];
  if (filter !== 'all') filtered = filtered.filter(p => p.category === filter);
  if (availableOnly) filtered = filtered.filter(p => p.stock > 0);
  if (maxPrice < 100000) filtered = filtered.filter(p => Number(p.price) <= maxPrice);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }
  if (sort === 'price-asc') filtered.sort((a, b) => Number(a.price) - Number(b.price));
  else if (sort === 'price-desc') filtered.sort((a, b) => Number(b.price) - Number(a.price));
  else if (sort === 'name-asc') filtered.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'rating-desc') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const handleProductClick = (product: Product, index: number) => {
    if (product.category === 'ordinateurs') {
      if (selectedProduct?.id === product.id) {
        setSelectedProduct(null);
        setInsertAfterIndex(-1);
      } else {
        setSelectedProduct(product);
        setInsertAfterIndex(index);
      }
    } else {
      addItem({ product_id: product.id, name: product.name, price: Number(product.price), quantity: 1, image: product.image_url });
    }
  };

  // Construire la liste à afficher avec fiche injectée
  const itemsToRender: (Product | { __detail: true })[] = [];
  filtered.forEach((p, i) => {
    itemsToRender.push(p);
    if (i === insertAfterIndex && selectedProduct) {
      itemsToRender.push({ __detail: true });
    }
  });
  // Si index hors limites (après fermeture filtre), cacher
  const showDetail = selectedProduct && insertAfterIndex >= 0 && insertAfterIndex < filtered.length;

  return (
    <>
      <section className="hero-sm" style={{ backgroundImage: 'url(/images/tutorial-photos/motherboard-background.webp)' }}>
        <div className="container">
          <h1>Boutique</h1>
          <p>Composants électroniques, outils IT et accessoires pour vos projets.</p>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="price-filter" style={{ marginBottom: '2rem' }}>
            <label htmlFor="price-range">Filtrer par prix :</label>
            <input type="range" id="price-range" min="0" max="100000" step="1000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
            <span id="price-value">Max: {maxPrice.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* ── Barre de recherche en temps réel ── */}
          <div style={{
            position: 'relative',
            marginBottom: '1.5rem',
          }}>
            <span style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--clr-accent)',
              fontSize: '1.1rem',
              pointerEvents: 'none',
              zIndex: 1,
            }}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher un produit, une catégorie..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSelectedProduct(null); setInsertAfterIndex(-1); }}
              style={{
                width: '100%',
                padding: '0.85rem 3rem 0.85rem 2.8rem',
                background: 'rgba(0, 60, 87, 0.3)',
                border: `1px solid ${searchQuery ? 'var(--clr-accent)' : 'var(--clr-teal)'}`,
                borderRadius: '50px',
                color: 'var(--clr-white)',
                fontSize: '0.95rem',
                fontFamily: 'var(--font-main)',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: searchQuery ? '0 0 0 3px rgba(4,187,255,0.1)' : 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--clr-accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4,187,255,0.1)'; }}
              onBlur={e => { if (!searchQuery) { e.currentTarget.style.borderColor = 'var(--clr-teal)'; e.currentTarget.style.boxShadow = 'none'; } }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--clr-muted)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLElement).style.color = 'var(--clr-white)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'var(--clr-muted)'; }}
                title="Effacer"
              >✕</button>
            )}
          </div>

          <div className="filters-row" style={{ marginBottom: '2rem' }}>
            <div className="store-filters">
              <button className={`filter-btn ripple ${filter === 'all' ? 'active' : ''}`} onClick={() => { setFilter('all'); setSelectedProduct(null); }}>Tous</button>
              {CATEGORIES.map(cat => (
                <button key={cat} className={`filter-btn ripple ${filter === cat ? 'active' : ''}`} onClick={() => { setFilter(cat); setSelectedProduct(null); }}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="default">Trier par...</option>
                <option value="price-asc">Prix : croissant</option>
                <option value="price-desc">Prix : décroissant</option>
                <option value="name-asc">Nom : A → Z</option>
                <option value="rating-desc">Mieux notés</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--clr-muted)' }}>
                <input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)} />
                <span>Disponibles seulement</span>
              </label>
            </div>
          </div>

          {syncing && <p style={{ textAlign: 'center', color: 'var(--clr-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>Synchronisation...</p>}
          {error && <div style={{ textAlign: 'center', padding: '0.5rem', color: '#ff4757', fontSize: '0.85rem' }}>{error}</div>}

          <div className="grid-4" id="products-grid">
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--clr-muted)' }}>
                {searchQuery
                  ? <>Aucun résultat pour <strong style={{ color: 'var(--clr-accent)' }}>« {searchQuery} »</strong>.</>
                  : 'Aucun produit trouvé.'
                }
              </div>
            )}
            {filtered.map((product, index) => {
              const isSelected = selectedProduct?.id === product.id;
              const isNew = Date.now() - new Date(product.created_at).getTime() < 30 * 24 * 60 * 60 * 1000;
              const isPC = product.category === 'ordinateurs';
              return (
                <>
                  <div
                    key={product.id}
                    className="product-card card"
                    style={{ cursor: isPC ? 'pointer' : 'default', border: isSelected ? '2px solid var(--clr-accent)' : undefined, transition: 'border 0.2s' }}
                    onClick={() => isPC && handleProductClick(product, index)}
                  >
                    <div className="product-image">
                      <img src={product.image_url || '/images/products/placeholder.webp'} alt={product.name} loading="lazy" />
                      {isNew && <span className="product-badge badge" style={{ color: 'var(--clr-accent)', borderColor: 'var(--clr-accent)', background: 'rgba(4,187,255,0.1)' }}>Nouveau</span>}
                      {isPC && <span style={{ position: 'absolute', bottom: '0.5rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(4,187,255,0.85)', color: '#fff', fontSize: '0.7rem', padding: '2px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>🔧 Configurer</span>}
                      {!isPC && <button className="wishlist-btn" onClick={e => { e.stopPropagation(); addWishlist(product.id); }} title="Ajouter aux favoris">&#9825;</button>}
                    </div>
                    <div className="product-body">
                      <span className="product-category">{product.category}</span>
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-description">{product.description}</p>
                      {product.rating != null && (
                        <div className="product-rating">
                          <span className="stars">{'★'.repeat(Math.round(product.rating))}</span>
                          <span>({product.rating})</span>
                        </div>
                      )}
                      <div className="product-footer">
                        <span className="product-price">{Number(product.price).toLocaleString('fr-FR')} <span className="currency">FCFA</span></span>
                        {isPC ? (
                          <button className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={e => { e.stopPropagation(); handleProductClick(product, index); }}>
                            {isSelected ? '▲ Fermer' : '🔧 Config'}
                          </button>
                        ) : (
                          <button className="btn btn-primary btn-sm add-to-cart-btn" onClick={e => { e.stopPropagation(); addItem({ product_id: product.id, name: product.name, price: Number(product.price), quantity: 1, image: product.image_url }); }}>
                            Ajouter
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Fiche détail injectée après ce produit */}
                  {isSelected && showDetail && (
                    <ProductDetail
                      key={`detail-${product.id}`}
                      product={selectedProduct!}
                      onClose={() => { setSelectedProduct(null); setInsertAfterIndex(-1); }}
                    />
                  )}
                </>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
