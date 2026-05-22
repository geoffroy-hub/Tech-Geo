'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import Link from 'next/link';
import ShareButtons from '@/components/ShareButtons';

const HARDCODED_PRODUCTS: Record<string, { id: string; name: string; price: number; category: string; image: string; description: string; rating: number; stock: number }> = {
  'prod-vo1': { id: 'prod-vo1', name: 'Tech-Geo VO1', price: 35000, category: 'microcontrôleurs', image: '/images/products/VO1.webp', description: 'Contrôleur intelligent VO1 haute performance pour projets IoT et domotique avancés.', rating: 5.0, stock: 10 },
  'prod-vo2': { id: 'prod-vo2', name: 'Arduino Uno R3', price: 15000, category: 'microcontrôleurs', image: '/images/products/placeholder.webp', description: 'Carte de développement Arduino Uno R3 officielle.', rating: 4.8, stock: 15 },
  'prod-1': { id: 'prod-1', name: 'Résistance 1kΩ (x10)', price: 500, category: 'composants', image: '/images/products/placeholder.webp', description: 'Lot de 10 résistances 1kΩ 1/4W.', rating: 4.5, stock: 100 },
  'prod-2': { id: 'prod-2', name: 'LED 5mm (x10)', price: 1000, category: 'composants', image: '/images/products/placeholder.webp', description: 'Lot de 10 LED 5mm de couleur assorties.', rating: 4.7, stock: 50 },
  'prod-3': { id: 'prod-3', name: 'Kit Soudure', price: 8500, category: 'outils', image: '/images/products/placeholder.webp', description: 'Kit de soudure complet avec fer à souder, étain et pompe.', rating: 4.3, stock: 8 },
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { addItem } = useCart();
  const { addItem: addWishlist } = useWishlist();
  const [dbProduct, setDbProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      const cached = HARDCODED_PRODUCTS[slug];
      if (cached) {
        setDbProduct(cached);
        setLoading(false);
        return;
      }
      const supabase = getSupabase();
      const { data } = await supabase.from('products').select('*').eq('id', slug).single();
      if (data) setDbProduct(data);
      setLoading(false);
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <section className="section" style={{ paddingTop: '6rem', textAlign: 'center' }}>
        <div className="container"><div className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }}></div></div>
      </section>
    );
  }

  if (!dbProduct) {
    return (
      <section className="section" style={{ paddingTop: '6rem', textAlign: 'center' }}>
        <div className="container">
          <h1>Produit non trouvé</h1>
          <Link href="/boutique" className="btn btn-primary">Retour à la boutique</Link>
        </div>
      </section>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": dbProduct.name,
    "description": dbProduct.description,
    "image": dbProduct.image || dbProduct.image_url || '/images/products/placeholder.webp',
    "sku": dbProduct.id,
    "category": dbProduct.category,
    "offers": {
      "@type": "Offer",
      "url": `https://tech-geo.vercel.app/produit/${dbProduct.slug}`,
      "priceCurrency": "XOF",
      "price": String(dbProduct.price),
      "availability": dbProduct.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": { "@type": "Organization", "name": "Tech-Geo" }
    },
    "aggregateRating": dbProduct.rating ? {
      "@type": "AggregateRating",
      "ratingValue": String(dbProduct.rating),
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "1"
    } : undefined
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="section" style={{ paddingTop: '6rem' }}>
        <div className="container">
          <Link href="/boutique" style={{ color: 'var(--clr-muted)', fontSize: '0.85rem', display: 'inline-block', marginBottom: '2rem' }}>← Retour à la boutique</Link>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
            <div style={{ borderRadius: '12px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
              <img src={dbProduct.image || dbProduct.image_url || '/images/products/placeholder.webp'} alt={dbProduct.name} style={{ width: '100%', height: 'auto', display: 'block' }}  loading="lazy" decoding="async"/>
            </div>
            <div>
              <span style={{ color: 'var(--clr-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{dbProduct.category}</span>
              <h1 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{dbProduct.name}</h1>
              <div style={{ margin: '1rem 0' }}>
                <span className="stars">{'★'.repeat(Math.round(dbProduct.rating))}</span>
                <span style={{ marginLeft: '0.5rem', color: 'var(--clr-muted)' }}>({dbProduct.rating})</span>
              </div>
              <p style={{ lineHeight: '1.6', color: 'var(--clr-muted)' }}>{dbProduct.description}</p>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1.5rem 0', color: 'var(--clr-accent)' }}>
                {Number(dbProduct.price).toLocaleString('fr-FR')} <span style={{ fontSize: '1rem' }}>FCFA</span>
              </div>
              <div style={{ color: dbProduct.stock > 0 ? '#2ed573' : '#ff4757', marginBottom: '1.5rem' }}>
                {dbProduct.stock > 0 ? `✓ En stock (${dbProduct.stock} disponibles)` : '✗ Rupture de stock'}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => addItem({ product_id: dbProduct.id, name: dbProduct.name, price: Number(dbProduct.price), quantity: 1, image: dbProduct.image || dbProduct.image_url })}
                  disabled={dbProduct.stock <= 0}
                >
                  Ajouter au panier
                </button>
                <button className="btn btn-outline" onClick={() => addWishlist(dbProduct.id)} title="Ajouter aux favoris" style={{ padding: '0.75rem 1.5rem' }}>
                  ♡
                </button>
              </div>
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--clr-border)' }}>
                <ShareButtons title={dbProduct.name} description={dbProduct.description} url={`https://tech-geo.vercel.app/produit/${dbProduct.slug}`} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
