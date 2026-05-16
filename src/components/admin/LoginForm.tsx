'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function LoginForm({ onLogin }: { onLogin: (session: Session) => void }) {
  const supabase = getSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email, password,
      });

      if (signInError) {
        setError('Email ou mot de passe incorrect.');
        setLoading(false);
        return;
      }

      if (data.session) {
        // Lire le profil avec retry (le trigger peut être lent)
        let prof = null;
        for (let i = 0; i < 3; i++) {
          const { data: p } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session.user.id)
            .single();
          if (p) { prof = p; break; }
          await new Promise(r => setTimeout(r, 600));
        }

        if (prof?.role === 'admin') {
          // Seul un vrai admin peut accéder
          onLogin(data.session);
        } else {
          // Profil manquant OU rôle !== 'admin' → refus immédiat
          await supabase.auth.signOut();
          setError('Accès non autorisé. Vous devez être administrateur.');
        }
      }
    } catch {
      setError('Erreur de connexion. Vérifiez votre réseau.');
    }
    setLoading(false);
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--clr-accent)' }}>Administration</h2>
          <p style={{ color: 'var(--clr-muted)' }}>Espace sécurisé Tech‑Geo</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@tech-geo.com" required />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && (
            <div style={{ padding: '0.75rem', background: 'rgba(255, 71, 87, 0.1)', border: '1px solid #ff4757', borderRadius: 'var(--radius)', color: '#ff4757', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button onClick={() => window.location.href = '/'} style={{ color: 'var(--clr-muted)', fontSize: '0.85rem', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>← Retour au site</button>
        </div>
      </div>
    </div>
  );
}
