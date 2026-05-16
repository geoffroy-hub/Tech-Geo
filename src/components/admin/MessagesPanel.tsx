'use client';

import { getSupabase } from '@/lib/supabase';

interface Message {
  id: string; name: string; email: string; message: string;
  is_read: boolean; created_at: string;
}

export default function MessagesPanel({ messages, onRefresh }: { messages: Message[]; onRefresh: () => void }) {
  const supabase = getSupabase();

  async function deleteMessage(id: string) {
    if (!confirm('Supprimer ce message ?')) return;
    await supabase.from('contact_messages').delete().eq('id', id);
    onRefresh();
  }
  async function markMessageRead(id: string) {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
    onRefresh();
  }

  return (
    <div className="admin-panel active">
      <div className="admin-table-container">
        <table className="admin-table">
          <thead><tr><th>Nom</th><th>Email</th><th>Message</th><th>Date</th><th>Lu</th><th>Actions</th></tr></thead>
          <tbody>
            {messages.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--clr-muted)', padding: '2rem' }}>Aucun message</td></tr>
            ) : messages.map(m => (
              <tr key={m.id} style={{ opacity: m.is_read ? 0.6 : 1 }}>
                <td data-label="Nom"><strong>{m.name}</strong></td>
                <td data-label="Email"><a href={`mailto:${m.email}`} style={{ color: 'var(--clr-accent)' }}>{m.email}</a></td>
                <td data-label="Message" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message}</td>
                <td data-label="Date">{new Date(m.created_at).toLocaleDateString()}</td>
                <td data-label="Lu">{m.is_read ? '✅' : '🔵'}</td>
                <td data-label="Actions" className="actions" style={{ display: 'flex', gap: '0.5rem' }}>
                  {!m.is_read && <button className="table-action-btn" onClick={() => markMessageRead(m.id)}>Marquer lu</button>}
                  <button className="table-action-btn danger" onClick={() => deleteMessage(m.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
