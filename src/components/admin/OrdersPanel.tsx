'use client';

import { useState, useMemo } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Order } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  pending:    { label: 'En attente',   color: '#f0c040', emoji: '⏳' },
  processing: { label: 'En cours',     color: '#04bbff', emoji: '⚙️' },
  shipped:    { label: 'Expédié',      color: '#8bc34a', emoji: '🚚' },
  delivered:  { label: 'Livré',        color: '#4caf50', emoji: '✅' },
  cancelled:  { label: 'Annulé',       color: '#ff4757', emoji: '❌' },
};

type StatusKey = keyof typeof STATUS_CONFIG;

export default function OrdersPanel({ orders, onRefresh }: { orders: Order[]; onRefresh: () => void }) {
  const supabase = getSupabase();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<StatusKey | 'all'>('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  function notify(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // Statistiques rapides par statut
  const statsByStatus = useMemo(() =>
    Object.keys(STATUS_CONFIG).reduce((acc, key) => {
      acc[key] = orders.filter(o => o.status === key).length;
      return acc;
    }, {} as Record<string, number>)
  , [orders]);

  const totalRevenue = useMemo(() =>
    orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0), [orders]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (filterStatus !== 'all') list = list.filter(o => o.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        (o.customer as any)?.name?.toLowerCase().includes(q) ||
        (o.customer as any)?.email?.toLowerCase().includes(q) ||
        (o.customer as any)?.phone?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, filterStatus, search]);

  async function updateOrderStatus(order: Order, newStatus: string) {
    setUpdatingId(order.id);
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', order.id);
    if (!error) {
      try {
        await fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'status_update', order, newStatus }),
        });
      } catch {}
      notify(`Statut mis à jour → ${STATUS_CONFIG[newStatus]?.label}`);
      onRefresh();
    } else {
      notify(error.message, 'err');
    }
    setUpdatingId(null);
  }

  async function deleteOrder(id: string) {
    if (!confirm('Supprimer définitivement cette commande ?')) return;
    await supabase.from('orders').delete().eq('id', id);
    onRefresh();
    notify('Commande supprimée');
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

      {/* Tuiles statut cliquables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {(Object.entries(STATUS_CONFIG) as [StatusKey, typeof STATUS_CONFIG[string]][]).map(([key, cfg]) => (
          <div key={key}
            onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
            style={{
              cursor: 'pointer', padding: '0.75rem 1rem', borderRadius: '10px', textAlign: 'center',
              background: filterStatus === key ? `${cfg.color}22` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${filterStatus === key ? cfg.color : 'var(--clr-border)'}`,
              transition: 'all 0.2s',
            }}>
            <div style={{ fontSize: '1.3rem' }}>{cfg.emoji}</div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: cfg.color }}>{statsByStatus[key] || 0}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--clr-muted)' }}>{cfg.label}</div>
          </div>
        ))}
        <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', textAlign: 'center',
          background: 'rgba(4,187,255,0.05)', border: '1px solid rgba(4,187,255,0.2)' }}>
          <div style={{ fontSize: '1.3rem' }}>💰</div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--clr-accent)' }}>
            {totalRevenue.toLocaleString('fr-FR')}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--clr-muted)' }}>FCFA total</div>
        </div>
      </div>

      {/* Barre de recherche + alerte */}
      {statsByStatus['pending'] > 0 && (
        <div style={{ background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.3)',
          borderRadius: '8px', padding: '0.65rem 1rem', marginBottom: '1rem', fontSize: '0.87rem', color: '#f0c040' }}>
          ⚠️ {statsByStatus['pending']} commande{statsByStatus['pending'] > 1 ? 's' : ''} en attente de traitement
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="🔍 Rechercher par ID, nom, email, téléphone..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '220px', padding: '0.6rem 1rem', borderRadius: '8px',
            background: 'rgba(0,60,87,0.3)', border: '1px solid var(--clr-teal)',
            color: 'var(--clr-white)', fontSize: '0.88rem', outline: 'none', fontFamily: 'var(--font-main)' }}
        />
        {(filterStatus !== 'all' || search) && (
          <button onClick={() => { setFilterStatus('all'); setSearch(''); }}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--clr-border)', color: 'var(--clr-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>
            Réinitialiser ✕
          </button>
        )}
      </div>

      <div style={{ fontSize: '0.82rem', color: 'var(--clr-muted)', marginBottom: '1rem' }}>
        {filtered.length} commande{filtered.length !== 1 ? 's' : ''} affichée{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Tableau */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Commande</th>
              <th>Client</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--clr-muted)', padding: '3rem' }}>Aucune commande trouvée</td></tr>
            )}
            {filtered.map(o => {
              const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG['pending'];
              const isExpanded = expandedId === o.id;
              const isUpdating = updatingId === o.id;

              return (
                <>
                  <tr key={o.id} style={{ cursor: 'pointer', opacity: isUpdating ? 0.6 : 1, transition: 'opacity 0.2s' }}
                    onClick={() => setExpandedId(isExpanded ? null : o.id)}>
                    <td data-label="Commande">
                      <span style={{ color: 'var(--clr-accent)', fontWeight: 700, fontFamily: 'monospace' }}>
                        #{o.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span style={{ marginLeft: 6, fontSize: '0.72rem', color: 'var(--clr-muted)' }}>{isExpanded ? '▲' : '▼'}</span>
                    </td>
                    <td data-label="Client">
                      <div style={{ fontWeight: 600 }}>{(o.customer as any)?.name || 'Client'}</div>
                      <div style={{ fontSize: '0.77rem', color: 'var(--clr-muted)' }}>{(o.customer as any)?.email}</div>
                    </td>
                    <td data-label="Total" style={{ fontWeight: 700, color: 'var(--clr-accent)' }}>
                      {Number(o.total).toLocaleString('fr-FR')} F
                    </td>
                    <td data-label="Statut">
                      <span style={{ color: cfg.color, fontWeight: 600, fontSize: '0.85rem' }}>{cfg.emoji} {cfg.label}</span>
                    </td>
                    <td data-label="Date">{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                    <td data-label="Actions" onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select value={o.status} onChange={e => updateOrderStatus(o, e.target.value)}
                          disabled={isUpdating}
                          style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', background: 'var(--clr-surface)',
                            color: 'var(--clr-text)', border: '1px solid var(--clr-border)', fontSize: '0.82rem', cursor: 'pointer' }}>
                          <option value="pending">⏳ En attente</option>
                          <option value="processing">⚙️ En cours</option>
                          <option value="shipped">🚚 Expédié</option>
                          <option value="delivered">✅ Livré</option>
                          <option value="cancelled">❌ Annulé</option>
                        </select>
                        <button className="table-action-btn danger" onClick={() => deleteOrder(o.id)}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>🗑</button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${o.id}-detail`}>
                      <td colSpan={6} style={{ padding: '1rem 1.5rem', background: 'rgba(4,187,255,0.03)', borderBottom: '2px solid rgba(4,187,255,0.15)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.88rem' }}>
                          {/* Articles */}
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--clr-muted)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.08em' }}>
                              🛒 Articles commandés
                            </div>
                            {(o.items || []).map((item: any, i: number) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--clr-border)' }}>
                                <span>{item.name} <span style={{ color: 'var(--clr-muted)' }}>×{item.qty || item.quantity}</span></span>
                                <span style={{ fontWeight: 600 }}>{Number(item.price * (item.qty || item.quantity)).toLocaleString('fr-FR')} F</span>
                              </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontWeight: 700, color: 'var(--clr-accent)', marginTop: '4px' }}>
                              <span>Total</span>
                              <span>{Number(o.total).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          </div>

                          {/* Infos client */}
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--clr-muted)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.08em' }}>
                              👤 Informations client
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <div>👤 {(o.customer as any)?.name || '—'}</div>
                              <div>📞 {(o.customer as any)?.phone || '—'}</div>
                              <div>📍 {(o.customer as any)?.address || '—'}</div>
                            </div>
                            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                              <a href={`mailto:${(o.customer as any)?.email}`}
                                style={{ color: 'var(--clr-accent)', fontSize: '0.82rem', textDecoration: 'none' }}>
                                ✉️ Envoyer un email
                              </a>
                              <a href={`/suivi-commande?id=${o.id}`} target="_blank"
                                style={{ color: 'var(--clr-accent)', fontSize: '0.82rem', textDecoration: 'none' }}>
                                🔗 Suivi client
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}
