'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';

const PRODUCTS = [
  { id: 'prod-vo1', name: 'Tech-Geo VO1', price: 35000, category: 'microcontrôleurs', image: '/images/products/VO1.webp', description: 'Contrôleur intelligent VO1 haute performance pour projets IoT et domotique avancés.', rating: 5.0, stock: 10 },
  { id: 'prod-vo2', name: 'Arduino Uno R3', price: 15000, category: 'microcontrôleurs', image: '/images/products/placeholder.jpg', description: 'Carte de développement Arduino Uno R3 officielle.', rating: 4.8, stock: 15 },
  { id: 'prod-1', name: 'Résistance 1kΩ (x10)', price: 500, category: 'composants', image: '/images/products/placeholder.jpg', description: 'Lot de 10 résistances 1kΩ 1/4W.', rating: 4.5, stock: 100 },
  { id: 'prod-2', name: 'LED 5mm (x10)', price: 1000, category: 'composants', image: '/images/products/placeholder.jpg', description: 'Lot de 10 LED 5mm de couleur assorties.', rating: 4.7, stock: 50 },
  { id: 'prod-3', name: 'Kit Soudure', price: 8500, category: 'outils', image: '/images/products/placeholder.jpg', description: 'Kit de soudure complet avec fer à souder, étain et pompe.', rating: 4.3, stock: 8 },
];

const CATEGORIES = ['microcontrôleurs', 'composants', 'accessoires', 'outils', 'ordinateurs'];

export default function BoutiquePage() {
  const { addItem } = useCart();
  const { addItem: addWishlist } = useWishlist();
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('default');
  const [maxPrice, setMaxPrice] = useState(100000);
  const [availableOnly, setAvailableOnly] = useState(false);

  let filtered = [...PRODUCTS];

  if (filter !== 'all') filtered = filtered.filter(p => p.category === filter);
  if (availableOnly) filtered = filtered.filter(p => p.stock > 0);
  if (maxPrice < 100000) filtered = filtered.filter(p => p.price <= maxPrice);

  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (sort === 'name-asc') filtered.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'rating-desc') filtered.sort((a, b) => b.rating - a.rating);

  return (
    <>
      <section className="hero-sm" style={{ backgroundImage: 'url(/images/tutorial-photos/motherboard-background.jpg)' }}>
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
          <div className="filters-row" style={{ marginBottom: '2rem' }}>
            <div className="store-filters">
              <button className={`filter-btn ripple ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Tous</button>
              {CATEGORIES.map(cat => (
                <button key={cat} className={`filter-btn ripple ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
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

          <div className="grid-4" id="products-grid">
            {filtered.map(product => (
              <div key={product.id} className="product-card card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} loading="eager" />
                  <span className="product-badge badge" style={{ color: 'var(--clr-accent)', borderColor: 'var(--clr-accent)', background: 'rgba(4,187,255,0.1)' }}>Nouveau</span>
                  <button className="wishlist-btn" onClick={() => addWishlist(product.id)} title="Ajouter aux favoris">&#9825;</button>
                </div>
                <div className="product-body">
                  <span className="product-category">{product.category}</span>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-rating">
                    <span className="stars">{'★'.repeat(Math.round(product.rating))}</span>
                    <span>({product.rating})</span>
                  </div>
                  <div className="product-footer">
                    <span className="product-price">{product.price.toLocaleString('fr-FR')} <span className="currency">FCFA</span></span>
                    <button className="btn btn-primary btn-sm add-to-cart-btn" onClick={() => addItem({ product_id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image })}>
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
