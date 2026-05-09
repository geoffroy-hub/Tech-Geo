'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Panel = 'dashboard' | 'products' | 'orders' | 'media' | 'settings';

export default function AdminPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>('dashboard');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, messages: 0 });

  useEffect(() => {
    if (!user) return;
    checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user!.id)
      .single();
    if (data?.role !== 'admin') {
      router.push('/');
    } else {
      setIsAdmin(true);
      loadStats();
    }
  };

  const loadStats = async () => {
    const supabase = getSupabase();
    const { count: products } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: orders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: messages } = await supabase.from('contact_messages').select('*', { count: 'exact', head: true });
    const { data: orderData } = await supabase.from('orders').select('total');
    const revenue = orderData?.reduce((sum, o) => sum + (Number(o.total) || 0), 0) || 0;
    setStats({ products: products || 0, orders: orders || 0, revenue, messages: messages || 0 });
  };

  if (!user) {
    return (
      <div className="admin-login">
        <div className="admin-login-card card">
          <h2>Administration</h2>
          <p className="subtitle" style={{ color: 'var(--clr-muted)' }}>Connectez-vous pour accéder</p>
          <Link href="/account" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Se connecter</Link>
        </div>
      </div>
    );
  }

  if (isAdmin === null) {
    return (
      <div className="admin-login">
        <div className="admin-login-card card" style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--clr-muted)' }}>Vérification...</p>
        </div>
      </div>
    );
  }

  const navItems: { id: Panel; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
    { id: 'products', label: 'Produits', icon: '📦' },
    { id: 'orders', label: 'Commandes', icon: '🛒' },
    { id: 'media', label: 'Média', icon: '🖼️' },
    { id: 'settings', label: 'Paramètres', icon: '⚙️' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>Tech‑Geo</h2>
          <p style={{ color: 'var(--clr-muted)', fontSize: '0.8rem' }}>Administration</p>
        </div>
        <nav className="admin-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`admin-nav-item ${panel === item.id ? 'active' : ''}`}
              onClick={() => setPanel(item.id)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <button className="admin-nav-item" onClick={signOut} style={{ marginTop: 'auto', color: '#ff4757' }}>
            <span className="icon">🚪</span> Déconnexion
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <h1>{navItems.find(n => n.id === panel)?.label}</h1>
          <div className="admin-user">
            <div className="admin-avatar">{user.email?.charAt(0).toUpperCase()}</div>
            <span>{user.user_metadata?.name || user.email}</span>
          </div>
        </div>

        {panel === 'dashboard' && (
          <div className="admin-panel active">
            <div className="admin-stats">
              <div className="stat-card card">
                <div className="stat-card-icon">📦</div>
                <div>
                  <div className="stat-card-value">{stats.products}</div>
                  <div className="stat-card-label">Produits</div>
                </div>
              </div>
              <div className="stat-card card">
                <div className="stat-card-icon">🛒</div>
                <div>
                  <div className="stat-card-value">{stats.orders}</div>
                  <div className="stat-card-label">Commandes</div>
                </div>
              </div>
              <div className="stat-card card">
                <div className="stat-card-icon">💰</div>
                <div>
                  <div className="stat-card-value">{stats.revenue.toLocaleString('fr-FR')}</div>
                  <div className="stat-card-label">Revenus (FCFA)</div>
                </div>
              </div>
              <div className="stat-card card">
                <div className="stat-card-icon">✉️</div>
                <div>
                  <div className="stat-card-value">{stats.messages}</div>
                  <div className="stat-card-label">Messages</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {panel === 'products' && (
          <div className="admin-panel active">
            <div className="admin-section">
              <h3>Ajouter un produit</h3>
              <p style={{ color: 'var(--clr-muted)' }}>Formulaire d&apos;ajout de produit (à implémenter)</p>
            </div>
          </div>
        )}

        {panel === 'orders' && (
          <div className="admin-panel active">
            <div className="admin-section">
              <h3>Commandes récentes</h3>
              <p style={{ color: 'var(--clr-muted)' }}>Liste des commandes (à implémenter)</p>
            </div>
          </div>
        )}

        {panel === 'media' && (
          <div className="admin-panel active">
            <div className="admin-section">
              <h3>Galerie média</h3>
              <p style={{ color: 'var(--clr-muted)' }}>Gestion des images et vidéos (à implémenter)</p>
            </div>
          </div>
        )}

        {panel === 'settings' && (
          <div className="admin-panel active">
            <div className="admin-section">
              <h3>Paramètres du site</h3>
              <p style={{ color: 'var(--clr-muted)' }}>Configuration générale (à implémenter)</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
