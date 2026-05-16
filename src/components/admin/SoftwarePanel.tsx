'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';

export default function SoftwarePanel({ links, onRefresh }: { links: { proteus: string; office: string; pmas: string }; onRefresh: () => void }) {
  const supabase = getSupabase();
  const [softwareLinks, setSoftwareLinks] = useState(links);

  return (
    <div className="admin-panel active">
      <div className="admin-section">
        <h3>Gestion des Téléchargements Logiciels</h3>
        <p style={{ color: 'var(--clr-muted)', marginBottom: '1.5rem' }}>Configurez les liens de téléchargement pour vos logiciels phares.</p>
        <div className="card" style={{ padding: '1.5rem', display: 'grid', gap: '1.5rem' }}>
          <div className="form-group">
            <label>Lien Proteus (Schémas & Simulation)</label>
            <input type="text" value={softwareLinks.proteus} onChange={e => setSoftwareLinks({...softwareLinks, proteus: e.target.value})} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Lien Simple Installeur Office</label>
            <input type="text" value={softwareLinks.office} onChange={e => setSoftwareLinks({...softwareLinks, office: e.target.value})} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Lien PMAS (Activateur Windows)</label>
            <input type="text" value={softwareLinks.pmas} onChange={e => setSoftwareLinks({...softwareLinks, pmas: e.target.value})} placeholder="https://..." />
          </div>
          <button
            className="btn btn-primary"
            onClick={async () => {
              const updates = [
                { key: 'soft_proteus', value: softwareLinks.proteus },
                { key: 'soft_office', value: softwareLinks.office },
                { key: 'soft_pmas', value: softwareLinks.pmas }
              ];
              const { error } = await supabase.from('site_settings').upsert(updates, { onConflict: 'key' });
              if (!error) alert('Liens logiciels mis à jour !');
              else alert('Erreur : ' + error.message);
            }}
          >
            💾 Enregistrer tous les liens
          </button>
        </div>
      </div>
    </div>
  );
}
