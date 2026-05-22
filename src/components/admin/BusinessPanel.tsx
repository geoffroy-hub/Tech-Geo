'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';

export default function BusinessPanel({ hiveqashLink: initialLink }: { hiveqashLink: string }) {
  const supabase = getSupabase();
  const [hiveqashLink, setHiveqashLink] = useState(initialLink);

  return (
    <div className="admin-panel active">
      <div className="admin-section">
        <h3>Rapports Business & Ventes</h3>
        <p style={{ color: 'var(--clr-muted)' }}>Analyses détaillées de la performance commerciale.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          <div className="card" style={{ padding: '1rem' }}>
            <h4>Conversion</h4>
            <div className="stat-card-value">3.2%</div>
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            <h4>Panier Moyen</h4>
            <div className="stat-card-value">45k</div>
          </div>
        </div>
      </div>
      <div className="admin-section" style={{ marginTop: '2rem' }}>
        <h3>Promotion HiveQash</h3>
        <p style={{ color: 'var(--clr-muted)', marginBottom: '1.5rem' }}>Configurez votre lien d&apos;invitation pour la promotion sur la page Business.</p>
        <div className="form-group">
          <label>Lien d&apos;invitation HiveQash</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input type="text" value={hiveqashLink} onChange={(e) => setHiveqashLink(e.target.value)}
              placeholder="https://www.hiveqash.com/register?ref=votre_id" style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={async () => {
              const { error } = await supabase.from('site_settings').upsert({ key: 'hiveqash_link', value: hiveqashLink }, { onConflict: 'key' });
              if (!error) alert('Lien mis à jour !');
            }}>
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
