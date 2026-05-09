'use client';

import { useState, useEffect } from 'react';
import { useWishlist } from '@/hooks/useWishlist';
import Link from 'next/link';

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const [tab, setTab] = useState('all');

  const filteredItems = tab === 'all' ? items : items.filter(i => i.item_type === tab);

  return (
    <>
      <section className="section" style={{ paddingTop: '6rem', paddingBottom: '1rem' }}>
        <div className="container">
          <h1>Ma Wishlist</h1>
          <p>Retrouvez vos produits et tutoriels favoris.</p>
        </div>
      </section>

      <section className="section" style={{ background: 'rgba(0,60,87,0.2)' }}>
        <div className="container">
          <div className="wishlist-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--clr-border)', paddingBottom: '1rem' }}>
            {['all', 'products', 'tutorials'].map(t => (
              <button key={t} className={`filter-btn ripple ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'all' ? 'Tout' : t === 'products' ? 'Produits' : 'Tutoriels'}
              </button>
            ))}
          </div>

          <p id="wishlist-count" style={{ color: 'var(--clr-muted)', marginBottom: '1.5rem' }}>
            {filteredItems.length} élément{filteredItems.length !== 1 ? 's' : ''}
          </p>

          {filteredItems.length === 0 ? (
            <div id="wishlist-empty" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>♡</div>
              <h3>Votre wishlist est vide</h3>
              <p style={{ color: 'var(--clr-muted)', margin: '1rem 0 2rem' }}>Ajoutez des produits ou tutoriels en cliquant sur le bouton ♡</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/boutique" className="btn btn-primary ripple">Voir la boutique</Link>
                <Link href="/tutorials" className="btn btn-outline ripple">Voir les tutoriels</Link>
              </div>
            </div>
          ) : (
            <div className="grid-4" id="wishlist-products-grid">
              {filteredItems.map(item => (
                <div key={item.id} className="product-card card">
                  <div className="product-body">
                    <h3 className="product-name">{item.item_id}</h3>
                    <button className="btn btn-outline btn-sm" onClick={() => removeItem(item.item_id, item.item_type)}>
                      Retirer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
