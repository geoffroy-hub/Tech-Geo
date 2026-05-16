'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';

type PdfOrder = {
  id: string;
  guide_title: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'sent' | 'cancelled';
  created_at: string;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: '⏳ En attente', color: '#f0c040' },
  confirmed: { label: '✅ Payé',       color: '#4caf50' },
  sent:      { label: '📨 PDF Envoyé', color: '#04bbff' },
  cancelled: { label: '❌ Annulé',     color: '#ff4757' },
};

export default function PdfOrdersPanel() {
  const [orders, setOrders] = useState<PdfOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    setLoading(true);
    const supabase = getSupabase();
    const { data } = await supabase
      .from('pdf_orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setOrders(data as PdfOrder[]);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const supabase = getSupabase();
    await supabase.from('pdf_orders').update({ status }).eq('id', id);
    loadOrders();
  }

  const pending = orders.filter(o => o.status === 'pending').length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Commandes PDF</h2>
          {pending > 0 && (
            <span style={{ fontSize: '0.82rem', color: '#f0c040', marginTop: '0.25rem', display: 'block' }}>
              ⚠️ {pending} commande{pending > 1 ? 's' : ''} en attente de confirmation
            </span>
          )}
        </div>
        <button className="btn btn-outline btn-sm" onClick={loadOrders}>🔄 Actualiser</button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--clr-muted)' }}>Chargement...</p>
      ) : orders.length === 0 ? (
        <p style={{ color: 'var(--clr-muted)' }}>Aucune commande PDF pour l'instant.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--clr-border)' }}>
                {['Date', 'Client', 'Email', 'Téléphone', 'Guide', 'Montant', 'Statut', 'Action'].map(h => (
                  <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--clr-muted)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                  <td style={{ padding: '0.7rem 0.75rem', color: 'var(--clr-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(o.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '0.7rem 0.75rem', fontWeight: 600 }}>{o.customer_name}</td>
                  <td style={{ padding: '0.7rem 0.75rem' }}>
                    <a href={`mailto:${o.customer_email}`} style={{ color: 'var(--clr-accent)' }}>{o.customer_email}</a>
                  </td>
                  <td style={{ padding: '0.7rem 0.75rem', color: 'var(--clr-muted)' }}>{o.customer_phone || '—'}</td>
                  <td style={{ padding: '0.7rem 0.75rem' }}>{o.guide_title}</td>
                  <td style={{ padding: '0.7rem 0.75rem', color: 'var(--clr-accent)', fontWeight: 700 }}>
                    {o.amount.toLocaleString('fr-FR')} F
                  </td>
                  <td style={{ padding: '0.7rem 0.75rem' }}>
                    <span style={{ color: STATUS_LABELS[o.status]?.color, fontWeight: 600, fontSize: '0.82rem' }}>
                      {STATUS_LABELS[o.status]?.label}
                    </span>
                  </td>
                  <td style={{ padding: '0.7rem 0.75rem' }}>
                    <select
                      value={o.status}
                      onChange={e => updateStatus(o.id, e.target.value)}
                      style={{
                        padding: '0.3rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem',
                        background: 'var(--clr-bg)', border: '1px solid var(--clr-border)',
                        color: 'var(--clr-text)', cursor: 'pointer',
                      }}
                    >
                      <option value="pending">En attente</option>
                      <option value="confirmed">Payé ✅</option>
                      <option value="sent">PDF Envoyé 📨</option>
                      <option value="cancelled">Annulé ❌</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
