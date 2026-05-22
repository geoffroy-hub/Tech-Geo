'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Tutorial } from '@/types';

export default function TutorialsPanel({ tutorials, onRefresh }: { tutorials: Tutorial[]; onRefresh: () => void }) {
  const supabase = getSupabase();
  const [loading, setLoading] = useState(false);
  const [newTutorial, setNewTutorial] = useState({
    title: '', slug: '', description: '', category: 'Electronique', published: false
  });

  async function handleAddTutorial(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const slug = newTutorial.slug || newTutorial.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await supabase.from('tutorials').insert([{ ...newTutorial, slug, published: newTutorial.published }]);
    setNewTutorial({ title: '', slug: '', description: '', category: 'Electronique', published: false });
    onRefresh();
    setLoading(false);
  }

  async function deleteTutorial(id: string) {
    if (!confirm('Supprimer ce tutoriel ?')) return;
    await supabase.from('tutorials').delete().eq('id', id);
    onRefresh();
  }
  async function toggleTutorial(id: string, current: boolean) {
    await supabase.from('tutorials').update({ published: !current }).eq('id', id);
    onRefresh();
  }

  return (
    <div className="admin-panel active">
      <div className="admin-section">
        <h3>Ajouter un tutoriel</h3>
        <form onSubmit={handleAddTutorial} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Titre</label>
              <input type="text" value={newTutorial.title} onChange={e => setNewTutorial({...newTutorial, title: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Catégorie</label>
              <select value={newTutorial.category} onChange={e => setNewTutorial({...newTutorial, category: e.target.value})}>
                <option>Electronique</option>
                <option>Arduino</option>
                <option>Informatique</option>
                <option>Programmation</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={newTutorial.description} onChange={e => setNewTutorial({...newTutorial, description: e.target.value})}
              rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'var(--clr-surface)', color: 'var(--clr-text)', border: '1px solid var(--clr-border)' }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
            <input type="checkbox" checked={newTutorial.published} onChange={e => setNewTutorial({...newTutorial, published: e.target.checked})} /> Publier immédiatement
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Ajout...' : 'Ajouter'}</button>
        </form>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead><tr><th>Titre</th><th>Catégorie</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {tutorials.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--clr-muted)', padding: '2rem' }}>Aucun tutoriel</td></tr>
            ) : tutorials.map(t => (
              <tr key={t.id}>
                <td data-label="Titre">{t.title}</td>
                <td data-label="Catégorie">{t.category}</td>
                <td data-label="Statut"><span style={{ color: t.published ? '#2ed573' : '#ff4757' }}>{t.published ? '✅ Publié' : '🔒 Brouillon'}</span></td>
                <td data-label="Date">{new Date(t.created_at).toLocaleDateString()}</td>
                <td data-label="Actions" className="actions" style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="table-action-btn" onClick={() => toggleTutorial(t.id, t.published)}>{t.published ? 'Masquer' : 'Publier'}</button>
                  <button className="table-action-btn danger" onClick={() => deleteTutorial(t.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
