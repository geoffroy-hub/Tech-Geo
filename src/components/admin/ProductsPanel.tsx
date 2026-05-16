'use client';

import { useState, useMemo } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Product } from '@/types';

const CATEGORIES = ['microcontrôleurs', 'composants', 'accessoires', 'outils', 'ordinateurs'];

type EditingField = { id: string; field: 'price' | 'stock'; value: string } | null;

export default function ProductsPanel({ products, onRefresh }: { products: Product[]; onRefresh: () => void }) {
  const supabase = getSupabase();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingField>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out'>('all');
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: '', price: '', stock: '10', category: 'composants',
    description: '', image_url: '', available: true,
  });

  function notify(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = useMemo(() => {
    let list = [...products];
    if (filterCat !== 'all') list = list.filter(p => p.category === filterCat);
    if (filterStock === 'low') list = list.filter(p => p.stock > 0 && p.stock <= 5);
    if (filterStock === 'out') list = list.filter(p => p.stock === 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    return list;
  }, [products, filterCat, filterStock, search]);

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outStockCount = products.filter(p => p.stock === 0).length;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('products').insert([{
      ...newProduct, price: Number(newProduct.price), stock: Number(newProduct.stock),
    }]);
    if (!error) {
      setNewProduct({ name: '', price: '', stock: '10', category: 'composants', description: '', image_url: '', available: true });
      setShowForm(false);
      onRefresh();
      notify('Produit ajouté avec succès !');
    } else {
      notify(error.message, 'err');
    }
    setLoading(false);
  }

  async function saveField(id: string, field: 'price' | 'stock', raw: string) {
    const val = Number(raw);
    if (isNaN(val) || val < 0) return;
    setSaving(id);
    const { error } = await supabase.from('products').update({ [field]: val }).eq('id', id);
    setSaving(null);
    setEditing(null);
    if (!error) { onRefresh(); notify(`${field === 'price' ? 'Prix' : 'Stock'} mis à jour`); }
    else notify(error.message, 'err');
  }

  async function toggleAvailable(p: Product) {
    setSaving(p.id);
    const { error } = await supabase.from('products').update({ available: !p.available }).eq('id', p.id);
    setSaving(null);
    if (!error) { onRefresh(); notify(`Produit ${!p.available ? 'activé' : 'désactivé'}`); }
    else notify(error.message, 'err');
  }

  async function quickStock(p: Product, delta: number) {
    const newStock = Math.max(0, p.stock + delta);
    setSaving(p.id);
    await supabase.from('products').update({ stock: newStock }).eq('id', p.id);
    setSaving(null);
    onRefresh();
  }

  async function deleteProduct(id: string, name: string) {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    await supabase.from('products').delete().eq('id', id);
    onRefresh();
    notify('Produit supprimé');
  }

  return (
    <div className="admin-panel active">
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          padding: '0.75rem 1.25rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600,
          background: toast.type === 'ok' ? 'rgba(76,175,80,0.15)' : 'rgba(255,71,87,0.15)',
          border: `1px solid ${toast.type === 'ok' ? '#4caf50' : '#ff4757'}`,
          color: toast.type === 'ok' ? '#4caf50' : '#ff4757',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)', animation: 'fadeIn 0.2s ease',
        }}>
          {toast.type === 'ok' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* Alertes stock */}
      {(lowStockCount > 0 || outStockCount > 0) && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {outStockCount > 0 && (
            <div onClick={() => setFilterStock(filterStock === 'out' ? 'all' : 'out')}
              style={{ cursor: 'pointer', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                background: 'rgba(255,71,87,0.1)', border: `1px solid ${filterStock === 'out' ? '#ff4757' : 'rgba(255,71,87,0.3)'}`, color: '#ff4757' }}>
              🚫 {outStockCount} en rupture {filterStock === 'out' ? '(filtrés ✓)' : '— filtrer'}
            </div>
          )}
          {lowStockCount > 0 && (
            <div onClick={() => setFilterStock(filterStock === 'low' ? 'all' : 'low')}
              style={{ cursor: 'pointer', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                background: 'rgba(240,192,64,0.1)', border: `1px solid ${filterStock === 'low' ? '#f0c040' : 'rgba(240,192,64,0.3)'}`, color: '#f0c040' }}>
              ⚠️ {lowStockCount} stock faible {filterStock === 'low' ? '(filtrés ✓)' : '— filtrer'}
            </div>
          )}
        </div>
      )}

      {/* Barre de contrôle */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="🔍 Rechercher un produit..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '180px', padding: '0.6rem 1rem', borderRadius: '8px',
            background: 'rgba(0,60,87,0.3)', border: '1px solid var(--clr-teal)',
            color: 'var(--clr-white)', fontSize: '0.88rem', outline: 'none', fontFamily: 'var(--font-main)' }}
        />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          style={{ padding: '0.6rem 0.9rem', borderRadius: '8px', background: 'var(--clr-surface)',
            color: 'var(--clr-text)', border: '1px solid var(--clr-border)', fontSize: '0.88rem', cursor: 'pointer' }}>
          <option value="all">Toutes catégories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary"
          style={{ whiteSpace: 'nowrap', padding: '0.6rem 1.25rem' }}>
          {showForm ? '✕ Annuler' : '+ Nouveau produit'}
        </button>
      </div>

      <div style={{ fontSize: '0.82rem', color: 'var(--clr-muted)', marginBottom: '1.25rem' }}>
        {filtered.length} produit{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}
        {(filterStock !== 'all' || filterCat !== 'all' || search) && (
          <button onClick={() => { setSearch(''); setFilterCat('all'); setFilterStock('all'); }}
            style={{ marginLeft: '0.75rem', background: 'none', border: 'none', color: 'var(--clr-accent)', cursor: 'pointer', fontSize: '0.82rem' }}>
            Réinitialiser ✕
          </button>
        )}
      </div>

      {/* Formulaire ajout */}
      {showForm && (
        <div className="admin-section" style={{ marginBottom: '2rem', border: '1px solid rgba(4,187,255,0.3)', borderRadius: '12px' }}>
          <h3 style={{ marginTop: 0 }}>➕ Nouveau produit</h3>
          <form onSubmit={handleAdd} className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nom *</label>
                <input type="text" value={newProduct.name} required
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Catégorie *</label>
                <select value={newProduct.category}
                  onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Prix (FCFA) *</label>
                <input type="number" value={newProduct.price} required min="0"
                  onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Stock initial</label>
                <input type="number" value={newProduct.stock} min="0"
                  onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" value={newProduct.description}
                onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Description courte" />
            </div>
            <div className="form-group">
              <label>URL image</label>
              <input type="text" value={newProduct.image_url}
                onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })}
                placeholder="https://... ou /images/..." />
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Ajout...' : '✅ Ajouter'}
              </button>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--clr-muted)', cursor: 'pointer' }}>
                <input type="checkbox" checked={newProduct.available}
                  onChange={e => setNewProduct({ ...newProduct, available: e.target.checked })} />
                Disponible à la vente
              </label>
            </div>
          </form>
        </div>
      )}

      {/* Tableau */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Prix (FCFA) <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>dbl-clic</span></th>
              <th>Stock <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>dbl-clic</span></th>
              <th>Dispo</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--clr-muted)', padding: '3rem' }}>Aucun produit trouvé</td></tr>
            )}
            {filtered.map(p => {
              const isSavingThis = saving === p.id;
              const stockColor = p.stock === 0 ? '#ff4757' : p.stock <= 5 ? '#f0c040' : '#4caf50';
              const isEditingPrice = editing?.id === p.id && editing.field === 'price';
              const isEditingStock = editing?.id === p.id && editing.field === 'stock';

              return (
                <tr key={p.id} style={{ opacity: isSavingThis ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                  <td data-label="Produit">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {p.image_url && (
                        <img src={p.image_url} alt={p.name}
                          style={{ width: 34, height: 34, borderRadius: 6, objectFit: 'cover', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }} />
                      )}
                      <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.name}</span>
                    </div>
                  </td>

                  <td data-label="Catégorie">
                    <span style={{ fontSize: '0.78rem', color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {p.category}
                    </span>
                  </td>

                  {/* Prix éditable */}
                  <td data-label="Prix">
                    {isEditingPrice ? (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input type="number" autoFocus defaultValue={Number(p.price)} min="0"
                          style={{ width: 90, padding: '3px 6px', borderRadius: 6, background: 'var(--clr-surface)', border: '1px solid var(--clr-accent)', color: 'var(--clr-white)', fontSize: '0.85rem' }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveField(p.id, 'price', (e.target as HTMLInputElement).value);
                            if (e.key === 'Escape') setEditing(null);
                          }}
                          onChange={e => setEditing({ id: p.id, field: 'price', value: e.target.value })}
                        />
                        <button onClick={() => saveField(p.id, 'price', editing?.value ?? String(p.price))}
                          style={{ background: '#4caf50', border: 'none', borderRadius: 4, color: '#fff', padding: '3px 7px', cursor: 'pointer', fontSize: '0.75rem' }}>✓</button>
                        <button onClick={() => setEditing(null)}
                          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 4, color: 'var(--clr-muted)', padding: '3px 7px', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
                      </div>
                    ) : (
                      <span onDoubleClick={() => setEditing({ id: p.id, field: 'price', value: String(p.price) })}
                        title="Double-cliquer pour modifier"
                        style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--clr-accent)', borderBottom: '1px dashed rgba(4,187,255,0.4)' }}>
                        {Number(p.price).toLocaleString('fr-FR')}
                      </span>
                    )}
                  </td>

                  {/* Stock éditable + +/- */}
                  <td data-label="Stock">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <button onClick={() => quickStock(p, -1)} disabled={p.stock === 0 || isSavingThis}
                        style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--clr-border)', background: 'transparent', color: 'var(--clr-muted)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      {isEditingStock ? (
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <input type="number" autoFocus min="0" defaultValue={p.stock}
                            style={{ width: 55, padding: '3px 6px', borderRadius: 6, background: 'var(--clr-surface)', border: '1px solid var(--clr-accent)', color: 'var(--clr-white)', fontSize: '0.85rem', textAlign: 'center' }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveField(p.id, 'stock', (e.target as HTMLInputElement).value);
                              if (e.key === 'Escape') setEditing(null);
                            }}
                            onChange={e => setEditing({ id: p.id, field: 'stock', value: e.target.value })}
                          />
                          <button onClick={() => saveField(p.id, 'stock', editing?.value ?? String(p.stock))}
                            style={{ background: '#4caf50', border: 'none', borderRadius: 4, color: '#fff', padding: '3px 7px', cursor: 'pointer', fontSize: '0.75rem' }}>✓</button>
                          <button onClick={() => setEditing(null)}
                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 4, color: 'var(--clr-muted)', padding: '3px 7px', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
                        </div>
                      ) : (
                        <span onDoubleClick={() => setEditing({ id: p.id, field: 'stock', value: String(p.stock) })}
                          title="Double-cliquer pour modifier"
                          style={{ cursor: 'pointer', fontWeight: 700, color: stockColor, minWidth: 28, textAlign: 'center', borderBottom: '1px dashed rgba(4,187,255,0.3)' }}>
                          {p.stock}
                        </span>
                      )}
                      <button onClick={() => quickStock(p, +1)} disabled={isSavingThis}
                        style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--clr-border)', background: 'transparent', color: 'var(--clr-muted)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </td>

                  {/* Toggle disponibilité */}
                  <td data-label="Dispo">
                    <button onClick={() => toggleAvailable(p)} disabled={isSavingThis}
                      style={{ padding: '3px 10px', borderRadius: '20px', border: `1px solid ${p.available ? 'rgba(76,175,80,0.4)' : 'rgba(255,71,87,0.4)'}`,
                        cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                        background: p.available ? 'rgba(76,175,80,0.15)' : 'rgba(255,71,87,0.15)',
                        color: p.available ? '#4caf50' : '#ff4757' }}>
                      {p.available ? '● Actif' : '○ Inactif'}
                    </button>
                  </td>

                  <td data-label="Actions" className="actions">
                    <button className="table-action-btn danger" onClick={() => deleteProduct(p.id, p.name)}>🗑 Suppr.</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}
