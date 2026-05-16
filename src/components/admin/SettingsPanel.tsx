'use client';

interface SettingsPanelProps {
  email: string;
  stats: { products: number; tutorials: number; users: number };
  onRefresh: () => void;
}

export default function SettingsPanel({ email, stats, onRefresh }: SettingsPanelProps) {
  return (
    <div className="admin-panel active">
      <div className="admin-section">
        <h3>Informations du site</h3>
        <p style={{ color: 'var(--clr-muted)', marginBottom: '1rem' }}>Email connecté : <strong>{email}</strong></p>
        <div className="admin-stats" style={{ marginTop: '1rem' }}>
          <div className="stat-card card">
            <div className="stat-card-icon">📦</div>
            <div><div className="stat-card-value">{stats.products}</div><div className="stat-card-label">Produits</div></div>
          </div>
          <div className="stat-card card">
            <div className="stat-card-icon">📚</div>
            <div><div className="stat-card-value">{stats.tutorials}</div><div className="stat-card-label">Tutoriels</div></div>
          </div>
          <div className="stat-card card">
            <div className="stat-card-icon">👥</div>
            <div><div className="stat-card-value">{stats.users}</div><div className="stat-card-label">Utilisateurs</div></div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={onRefresh} style={{ marginTop: '1.5rem' }}>🔄 Rafraîchir les données</button>
      </div>
    </div>
  );
}
