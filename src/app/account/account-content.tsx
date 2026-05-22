'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getSupabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdminAssistant from '@/components/AdminAssistant';

export default function AccountContent() {
  const { user, signIn, signOut } = useAuth();
  const searchParams = useSearchParams();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [tab, setTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePhoneError, setProfilePhoneError] = useState('');
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

  // Lock global scroll when in full-screen assistant mode
  useEffect(() => {
    if (tab === 'assistant') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [tab]);

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

  const formatTogoPhone = (value: string) => {
    // Remove all non-digit characters except leading +
    const digits = value.replace(/\D/g, '');
    
    // Handle different input cases
    let normalized = digits;
    if (digits.startsWith('228')) {
      normalized = digits.slice(3); // remove country code
    } else if (digits.startsWith('00228')) {
      normalized = digits.slice(5);
    }
    
    // Keep only 8 digits max (Togolese local number)
    normalized = normalized.slice(0, 8);
    
    // Format as XX XX XX XX
    const parts = [];
    for (let i = 0; i < normalized.length; i += 2) {
      parts.push(normalized.slice(i, i + 2));
    }
    
    const formatted = parts.join(' ');
    return normalized.length > 0 ? `+228 ${formatted}` : '';
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    
    // Allow clearing the field
    if (raw === '' || raw === '+228 ' || raw === '+228') {
      setProfilePhone('');
      setProfilePhoneError('');
      return;
    }
    
    const formatted = formatTogoPhone(raw);
    setProfilePhone(formatted);
    
    // Validate: +228 + 8 digits = full number
    const digits = formatted.replace(/\D/g, '').slice(3); // remove 228
    if (digits.length > 0 && digits.length < 8) {
      setProfilePhoneError('Le numéro doit contenir 8 chiffres après +228');
    } else {
      setProfilePhoneError('');
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    await supabase.auth.updateUser({
      data: { name: profileName, phone: profilePhone, address: profileAddress },
    });
    alert('Profil mis à jour avec succès !');
  };

  const statusLabels: Record<string, string> = {
    pending: 'En attente', processing: 'En cours', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
  };

  const statusColors: Record<string, string> = {
    pending: 'var(--clr-muted)', processing: 'var(--clr-accent)', shipped: '#4caf50', delivered: '#2e7d32', cancelled: '#ff4757',
  };

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const { signUp } = useAuth();

  if (!user && !isLoggingOut) {
    const handleAuthSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError('');
      if (authMode === 'login') {
        const { error } = await signIn(loginEmail, loginPassword);
        if (error) setLoginError(error.message);
      } else {
        const { error } = await signUp(regEmail, regPassword, regName);
        if (error) setLoginError(error.message);
        else {
          setAuthMode('login');
          setLoginError('Inscription réussie ! Un lien de confirmation a été envoyé à votre adresse e-mail. Veuillez cliquer sur ce lien pour valider votre identité et vous connecter.');
        }
      }
    };

    return (
      <div className="admin-login">
        <div className="admin-login-card card" style={{ maxWidth: 450, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--clr-accent)' }}>
              {authMode === 'login' ? 'Connexion' : 'Inscription'}
            </h2>
            <p style={{ color: 'var(--clr-muted)' }}>
              {authMode === 'login' ? 'Accédez à votre espace Tech-Geo' : 'Rejoignez la communauté Tech-Geo'}
            </p>
          </div>

          <div className="auth-tabs" style={{ display: 'flex', marginBottom: '1.5rem', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--clr-border)' }}>
            <button 
              type="button"
              className={`auth-tab ${authMode === 'login' ? 'active' : ''}`} 
              onClick={() => setAuthMode('login')}
              style={{ flex: 1, padding: '0.75rem', border: 'none', background: authMode === 'login' ? 'rgba(4, 187, 255, 0.1)' : 'transparent', color: authMode === 'login' ? 'var(--clr-text)' : 'var(--clr-muted)', cursor: 'pointer', fontWeight: authMode === 'login' ? 'bold' : 'normal', transition: 'all 0.2s' }}
            >
              Connexion
            </button>
            <button 
              type="button"
              className={`auth-tab ${authMode === 'register' ? 'active' : ''}`} 
              onClick={() => setAuthMode('register')}
              style={{ flex: 1, padding: '0.75rem', border: 'none', background: authMode === 'register' ? 'rgba(4, 187, 255, 0.1)' : 'transparent', color: authMode === 'register' ? 'var(--clr-text)' : 'var(--clr-muted)', cursor: 'pointer', fontWeight: authMode === 'register' ? 'bold' : 'normal', transition: 'all 0.2s' }}
            >
              Inscription
            </button>
          </div>

          {loginError && (
            <div style={{
              padding: '0.75rem',
              background: loginError.includes('créé') ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 71, 87, 0.1)',
              border: `1px solid ${loginError.includes('créé') ? '#2ed573' : '#ff4757'}`,
              borderRadius: 'var(--radius)',
              color: loginError.includes('créé') ? '#2ed573' : '#ff4757',
              fontSize: '0.875rem',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleAuthSubmit}>
            {authMode === 'register' && (
              <div className="form-group">
                <label>Nom complet</label>
                <input type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Jean Dupont" required />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={authMode === 'login' ? loginEmail : regEmail} onChange={e => authMode === 'login' ? setLoginEmail(e.target.value) : setRegEmail(e.target.value)} placeholder="votre@email.com" required />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" value={authMode === 'login' ? loginPassword : regPassword} onChange={e => authMode === 'login' ? setLoginPassword(e.target.value) : setRegPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
              {authMode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link href="/" style={{ color: 'var(--clr-muted)', fontSize: '0.85rem' }}>← Retour au site</Link>
          </div>
        </div>
      </div>
    );
  }

    return (
      <div className="admin-layout" style={{ 
        height: tab === 'assistant' ? '100vh' : 'auto', 
        overflow: tab === 'assistant' ? 'hidden' : 'visible' 
      }}>
        {isSidebarOpen && <div className="admin-sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>}
        <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ background: 'linear-gradient(180deg, var(--clr-deep) 0%, #051c24 100%)' }}>
          <div className="admin-logo">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--clr-accent)', fontWeight: 'bold', fontSize: '1.4rem' }}>Tech-Geo</span>
              <button className="close-sidebar-btn mobile-only" onClick={() => setIsSidebarOpen(false)}>✕</button>
            </div>
            <span style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', fontWeight: 'normal', color: 'var(--clr-white)' }}>Espace Client</span>
          </div>
          <nav className="admin-nav" style={{ padding: '1.5rem 1rem' }}>
            <button className={`admin-nav-item ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => { setTab('dashboard'); setIsSidebarOpen(false); }}>
              <span className="icon">📊</span> Tableau de bord
            </button>
            <button className={`admin-nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => { setTab('profile'); setIsSidebarOpen(false); }}>
              <span className="icon">👤</span> Profil & Sécurité
            </button>
            <button className={`admin-nav-item ${tab === 'orders' ? 'active' : ''}`} onClick={() => { setTab('orders'); setIsSidebarOpen(false); }}>
              <span className="icon">📦</span> Mes Commandes
            </button>
            <button className={`admin-nav-item ${tab === 'security' ? 'active' : ''}`} onClick={() => { setTab('security'); setIsSidebarOpen(false); }}>
              <span className="icon">🔒</span> Accès & Clés
            </button>
            <button className={`admin-nav-item ${tab === 'assistant' ? 'active' : ''}`} onClick={() => { setTab('assistant'); setIsSidebarOpen(false); }}>
              <span className="icon">🤖</span> Assistant IA
            </button>
            
            <div style={{ margin: '2rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}></div>
            
            <Link href="/" className="admin-nav-item">
              <span className="icon">🏠</span> Retour au site
            </Link>
            <button 
              className="admin-nav-item logout-btn" 
              onClick={async () => {
                setIsLoggingOut(true);
                await signOut();
                window.location.href = '/';
              }} 
              style={{ color: '#ff4757', marginTop: 'auto' }}
            >
              <span className="icon">🚪</span> Déconnexion
            </button>
          </nav>
        </aside>

        <main className="admin-main" style={{ 
          background: 'radial-gradient(circle at 50% 50%, rgba(4, 187, 255, 0.03) 0%, transparent 100%)',
          display: 'flex',
          flexDirection: 'column',
          height: tab === 'assistant' ? '100vh' : 'auto',
          paddingBottom: tab === 'assistant' ? '0' : undefined,
          overflow: tab === 'assistant' ? 'hidden' : 'visible'
        }}>
          <header className="admin-header" style={{ marginBottom: tab === 'assistant' ? '1rem' : '2rem' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.8rem', margin: 0 }}>
                {tab === 'dashboard' && 'Tableau de bord'}
                {tab === 'profile' && 'Mon Profil'}
                {tab === 'orders' && 'Mes Commandes'}
                {tab === 'security' && 'Sécurité'}
                {tab === 'assistant' && 'Assistant IA'}
              </h1>
              <p style={{ color: 'var(--clr-muted)', margin: '0.2rem 0 0', fontSize: '0.9rem' }}>
                {tab === 'dashboard' && 'Bienvenue dans votre espace personnel'}
                {tab === 'profile' && 'Gérez vos informations de contact'}
                {tab === 'orders' && 'Historique de vos achats Tech-Geo'}
                {tab === 'assistant' && 'Votre expert personnel en électronique'}
              </p>
            </div>
            {!isSidebarOpen && (
              <button 
                className="hamburger-btn" 
                onClick={() => setIsSidebarOpen(true)}
              >
                ☰
              </button>
            )}
            <div className="admin-user" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="admin-avatar" style={{ background: 'linear-gradient(135deg, var(--clr-accent) 0%, var(--clr-teal) 100%)' }}>
                {profileName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span style={{ fontWeight: 500 }}>{profileName || user?.email?.split('@')[0]}</span>
            </div>
          </header>

          <div className="admin-content" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            flex: 1,
            minHeight: 0,
            overflow: tab === 'assistant' ? 'hidden' : 'visible'
          }}>
            
            {tab === 'dashboard' && (
              <div style={{ width: '100%', maxWidth: 1000 }}>
                <div style={{ marginBottom: '2.5rem' }}>
                  <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Ravi de vous revoir, {profileName?.split(' ')[0] || 'Ami'} ! 👋</h2>
                  <p style={{ color: 'var(--clr-muted)', fontSize: '1.1rem' }}>Voici un aperçu de votre compte aujourd&apos;hui.</p>
                </div>
                
                <div className="admin-stats">
                  <div className="stat-card card hover-lift" style={{ border: '1px solid rgba(4, 187, 255, 0.2)' }}>
                    <div className="stat-card-icon" style={{ background: 'rgba(4, 187, 255, 0.1)', color: 'var(--clr-accent)' }}>📦</div>
                    <div>
                      <div className="stat-card-value">{orders.length}</div>
                      <div className="stat-card-label">Commandes passées</div>
                    </div>
                  </div>
                  <div className="stat-card card hover-lift">
                    <div className="stat-card-icon" style={{ background: 'rgba(255, 71, 87, 0.1)', color: '#ff4757' }}>❤️</div>
                    <div>
                      <div className="stat-card-value">0</div>
                      <div className="stat-card-label">Articles favoris</div>
                    </div>
                  </div>
                  <div className="stat-card card hover-lift">
                    <div className="stat-card-icon" style={{ background: 'rgba(46, 213, 115, 0.1)', color: '#2ed573' }}>📚</div>
                    <div>
                      <div className="stat-card-value">0</div>
                      <div className="stat-card-label">Tutoriels terminés</div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: '2.5rem', marginTop: '2rem', background: 'linear-gradient(135deg, rgba(4, 187, 255, 0.05) 0%, rgba(5, 28, 36, 0.8) 100%)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--clr-accent)', filter: 'blur(100px)', opacity: 0.1, pointerEvents: 'none' }}></div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Accès rapide à vos services</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                    <Link href="/boutique" className="btn btn-outline" style={{ justifyContent: 'center', padding: '1rem' }}>🛍️ Boutique</Link>
                    <Link href="/tutorials" className="btn btn-outline" style={{ justifyContent: 'center', padding: '1rem' }}>📖 Mes Cours</Link>
                    <button onClick={() => setTab('profile')} className="btn btn-primary" style={{ justifyContent: 'center', padding: '1rem' }}>⚙️ Paramètres</button>
                  </div>
                </div>
              </div>
            )}

            {tab === 'profile' && (
              <div className="card" style={{ width: '100%', maxWidth: 850, padding: '2.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--clr-accent)', borderBottom: '1px solid rgba(4, 187, 255, 0.1)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>👤</span> Informations Personnelles
                </h3>
                <form onSubmit={handleProfileSave} className="account-form">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Nom complet</label>
                      <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} required style={{ width: '100%' }} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Email</label>
                      <input type="email" value={profileEmail} disabled style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed', background: 'rgba(255,255,255,0.03)' }} />
                    </div>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>
                      Téléphone
                    </label>
                    <input
                        type="tel"
                        value={profilePhone}
                        onChange={handlePhoneChange}
                        onFocus={e => { if (!e.target.value) setProfilePhone('+228 '); }}
                        onBlur={e => { if (e.target.value === '+228 ' || e.target.value === '+228') setProfilePhone(''); }}
                        placeholder="+228 XX XX XX XX"
                        maxLength={17}
                        style={{
                          width: '100%',
                          paddingLeft: '2.75rem',
                          borderColor: profilePhoneError ? '#ff4757' : undefined,
                          boxShadow: profilePhoneError ? '0 0 0 2px rgba(255,71,87,0.15)' : undefined,
                        }}
                      />
                    {profilePhoneError && (
                      <p style={{ color: '#ff4757', fontSize: '0.8rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        ⚠️ {profilePhoneError}
                      </p>
                    )}
                    {profilePhone && !profilePhoneError && profilePhone.replace(/\D/g, '').length === 11 && (
                      <p style={{ color: '#4caf50', fontSize: '0.8rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        ✓ Numéro valide
                      </p>
                    )}
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label>Adresse de livraison par défaut</label>
                    <textarea rows={4} value={profileAddress} onChange={e => setProfileAddress(e.target.value)} placeholder="Indiquez votre ville, quartier et des précisions pour la livraison..." style={{ width: '100%', resize: 'vertical' }} />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '1rem', fontWeight: 600 }}>
                      Sauvegarder les modifications
                    </button>
                  </div>
                </form>
              </div>
            )}

            {tab === 'orders' && (
              <div style={{ width: '100%', maxWidth: 850 }}>
                {loadingOrders ? (
                  <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
                    <p>Chargement de votre historique...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>🛒</div>
                    <h3 style={{ fontSize: '1.5rem' }}>Votre panier est vide</h3>
                    <p style={{ color: 'var(--clr-muted)', marginBottom: '2rem', maxWidth: '400px', margin: '0.5rem auto 2rem' }}>Vous n&apos;avez pas encore passé de commande sur Tech-Geo. Découvrez nos produits !</p>
                    <Link href="/boutique" className="btn btn-primary" style={{ padding: '1rem 2.5rem' }}>Explorer la boutique</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {orders.map(order => (
                      <div key={order.id} className="card hover-lift" style={{ padding: '1.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                          <div>
                            <span style={{ display: 'block', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--clr-white)' }}>Commande #{order.id?.slice(0, 8)}</span>
                            <span style={{ color: 'var(--clr-muted)', fontSize: '0.95rem' }}>Effectuée le {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
                          <span style={{ 
                            padding: '0.6rem 1.25rem', 
                            borderRadius: '50px', 
                            fontSize: '0.85rem', 
                            fontWeight: 'bold',
                            backgroundColor: statusColors[order.status] ? `${statusColors[order.status]}15` : 'rgba(255,255,255,0.05)',
                            color: statusColors[order.status] || 'var(--clr-muted)',
                            border: `1px solid ${statusColors[order.status] || 'rgba(255,255,255,0.1)'}`
                          }}>
                            {statusLabels[order.status] || order.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--clr-accent)' }}>
                            {order.total?.toLocaleString('fr-FR')} FCFA
                          </div>
                          <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>Détails</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'security' && (
              <div className="card" style={{ width: '100%', maxWidth: 850, padding: '2.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--clr-accent)', borderBottom: '1px solid rgba(4, 187, 255, 0.1)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>🔒</span> Accès & Sécurité
                </h3>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ color: 'var(--clr-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    La sécurité de votre compte est notre priorité. Pour modifier votre mot de passe ou mettre à jour vos méthodes d&apos;authentification, veuillez utiliser le lien de sécurité envoyé par email.
                  </p>
                  <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Recevoir un lien de réinitialisation</button>
                </div>
              </div>
            )}

            {tab === 'assistant' && (
              <div style={{ width: '100%', maxWidth: '1000px', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <AdminAssistant role="user" />
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

