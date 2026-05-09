'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setName('');
      setError('');
      setMode('login');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) { setError(error.message); return; }
      } else {
        if (!name) { setError('Veuillez entrer votre nom'); return; }
        const { error } = await signUp(email, password, name);
        if (error) { setError(error.message); return; }
      }
      onClose();
      router.refresh();
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-overlay active" onClick={onClose}></div>
      <div className="auth-modal active">
        <div className="auth-modal-header">
          <h2>{mode === 'login' ? 'Connexion' : 'Inscription'}</h2>
          <button className="auth-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="auth-modal-body">
          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Connexion</button>
            <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Inscription</button>
          </div>

          {error && <div className="auth-error show">{error}</div>}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-group">
                <label>Nom complet</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" required />
              </div>
            )}
            <div className="form-group">
              <label>Adresse email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Votre mot de passe" required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
              {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
