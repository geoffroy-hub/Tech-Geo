'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getSupabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AccountContent() {
  const { user, signIn, signOut } = useAuth();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState('profile');
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t) setTab(t);
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setProfileName(user.user_metadata?.name || '');
      setProfileEmail(user.email || '');
      setProfilePhone(user.user_metadata?.phone || '');
      setProfileAddress(user.user_metadata?.address || '');
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    const supabase = getSupabase();
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoadingOrders(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) setLoginError(error.message);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    await supabase.auth.updateUser({
      data: { name: profileName, phone: profilePhone, address: profileAddress },
    });
  };

  const statusLabels: Record<string, string> = {
    pending: 'En attente', processing: 'En cours', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
  };

  const statusColors: Record<string, string> = {
    pending: 'var(--clr-muted)', processing: 'var(--clr-accent)', shipped: '#4caf50', delivered: '#2e7d32', cancelled: '#ff4757',
  };

  if (!user) {
    return (
      <section className="section" style={{ paddingTop: '6rem' }}>
        <div className="container" style={{ maxWidth: 450, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>&#128274;</div>
            <h2>Connexion</h2>
            <p style={{ color: 'var(--clr-muted)' }}>Connectez-vous pour accéder à votre compte</p>
          </div>
          {loginError && <div className="auth-error show">{loginError}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Se connecter</button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="hero-sm" style={{ backgroundImage: 'url(/images/tutorial-photos/close-up-electronic-components.jpg)' }}>
        <div className="container">
          <h1>Mon Compte</h1>
          <p>Gérez votre profil, vos commandes et vos préférences.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="account-layout">
            <aside className="account-sidebar">
              <div className="account-user-card">
                <div className="account-avatar">{profileName.charAt(0).toUpperCase() || 'U'}</div>
                <h3>{profileName || 'Utilisateur'}</h3>
                <p className="account-email">{profileEmail}</p>
                <span className="account-role">{user.user_metadata?.role || 'client'}</span>
              </div>
              <nav className="account-nav">
                {['profile', 'orders', 'security'].map(t => (
                  <a key={t} href={`#${t}`} className={`account-nav-item ${tab === t ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); setTab(t); }}>
                    <span>{t === 'profile' ? '👤' : t === 'orders' ? '📦' : '🔒'}</span>
                    {t === 'profile' ? 'Profil' : t === 'orders' ? 'Commandes' : 'Sécurité'}
                  </a>
                ))}
                <button className="account-nav-item logout-nav-btn" onClick={signOut}>
                  <span>🚪</span> Déconnexion
                </button>
              </nav>
            </aside>

            <div className="account-main">
              {tab === 'profile' && (
                <div className="account-tab active">
                  <h2 className="section-title">Mon Profil</h2>
                  <form onSubmit={handleProfileSave} className="account-form">
                    <div className="form-group">
                      <label>Nom complet</label>
                      <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value={profileEmail} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                    </div>
                    <div className="form-group">
                      <label>Téléphone</label>
                      <input type="tel" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} placeholder="+228 XX XX XX XX" />
                    </div>
                    <div className="form-group">
                      <label>Adresse</label>
                      <textarea rows={3} value={profileAddress} onChange={e => setProfileAddress(e.target.value)} placeholder="Votre adresse de livraison..." />
                    </div>
                    <button type="submit" className="btn btn-primary">Sauvegarder</button>
                  </form>
                </div>
              )}

              {tab === 'orders' && (
                <div className="account-tab active">
                  <h2 className="section-title">Mes Commandes</h2>
                  {loadingOrders ? (
                    <p>Chargement...</p>
                  ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</div>
                      <h3>Aucune commande</h3>
                      <p style={{ color: 'var(--clr-muted)' }}>Vous n&apos;avez pas encore passé de commande.</p>
                      <Link href="/boutique" className="btn btn-outline">Voir la boutique</Link>
                    </div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <div>
                            <span className="order-id">Commande #{order.id?.slice(0, 8)}</span>
                            <span className="order-date">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <span className="order-status" style={{ color: statusColors[order.status] || 'var(--clr-muted)' }}>
                            {statusLabels[order.status] || order.status}
                          </span>
                        </div>
                        <div className="order-total">{order.total?.toLocaleString('fr-FR')} FCFA</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === 'security' && (
                <div className="account-tab active">
                  <h2 className="section-title">Sécurité</h2>
                  <p>La gestion du mot de passe se fait depuis votre email.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
