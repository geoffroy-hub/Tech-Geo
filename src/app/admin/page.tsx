'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';
import AdminAssistant from '@/components/AdminAssistant';

type Panel = 'dashboard' | 'products' | 'orders' | 'tutorials' | 'software' | 'api' | 'business' | 'messages' | 'users' | 'assistant' | 'settings';

export default function AdminPage() {
  const supabase = getSupabase();

  // Auth state
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard state
  const [panel, setPanel] = useState<Panel>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, messages: 0, tutorials: 0, users: 0 });
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hiveqashLink, setHiveqashLink] = useState('https://www.hiveqash.com/');
  const [softwareLinks, setSoftwareLinks] = useState({ proteus: '', office: '', pmas: '' });
  const [apiPdfLink, setApiPdfLink] = useState('');
  const [opencodePdfLink, setOpencodePdfLink] = useState('');
  const [groqApiAdmin, setGroqApiAdmin] = useState('');
  const [groqApiUser, setGroqApiUser] = useState('');
  const [groqModelAdmin, setGroqModelAdmin] = useState('llama-3.3-70b-versatile');
  const [groqModelUser, setGroqModelUser] = useState('llama-3.3-70b-versatile');

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', stock: '0', category: 'Electronique', description: '', image_url: ''
  });

  // New tutorial form
  const [newTutorial, setNewTutorial] = useState({
    title: '', slug: '', description: '', category: 'Electronique', published: false
  });

  // ─── AUTO-LOGIN : vérifier si une session existe déjà ───
  useEffect(() => {
    const timeout = setTimeout(() => setChecking(false), 3000); // Max 3s
    const init = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (s?.user) {
          setSession(s);
          setIsAdmin(true);
        }
      } catch (e) {
        // Silencieux
      }
      clearTimeout(timeout);
      setChecking(false);
    };
    init();
    return () => clearTimeout(timeout);
  }, []);

  // Charger les données une fois connecté
  useEffect(() => {
    if (isAdmin && session) {
      loadAllData();
    }
  }, [isAdmin]);

  // ─── CONNEXION ───
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPass,
      });

      if (error) {
        setLoginError('Email ou mot de passe incorrect.');
        setLoginLoading(false);
        return;
      }

      // Connexion réussie → on entre directement
      if (data.session) {
        setSession(data.session);
        setIsAdmin(true);
      }
    } catch (err) {
      setLoginError('Erreur de connexion.');
    }
    setLoginLoading(false);
  }


  // ─── DÉCONNEXION ───
  function handleLogout() {
    supabase.auth.signOut();
    localStorage.clear();
    window.location.href = '/';
  }

  // ─── CHARGEMENT DES DONNÉES ───
  async function loadAllData() {
    try {
      const [r1, r2, r3, r4, r5, r6] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('tutorials').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total'),
      ]);
      const revenue = r6.data?.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0) || 0;
      setStats({
        products: r1.count || 0, orders: r2.count || 0, revenue,
        messages: r3.count || 0, tutorials: r4.count || 0, users: r5.count || 0
      });

      const [pRes, oRes, tRes, mRes, uRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('tutorials').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      ]);
      if (pRes.data) setProducts(pRes.data);
      if (oRes.data) setOrders(oRes.data);
      if (tRes.data) setTutorials(tRes.data);
      if (mRes.data) setMessages(mRes.data);
      if (uRes.data) setUsers(uRes.data);

      // Charger le lien HiveQash depuis les settings
      const { data: sData } = await supabase.from('site_settings').select('key, value');
      if (sData) {
        const hLink = sData.find(s => s.key === 'hiveqash_link');
        if (hLink) setHiveqashLink(hLink.value);
        
        const links = { ...softwareLinks };
        const pLink = sData.find(s => s.key === 'soft_proteus');
        const oLink = sData.find(s => s.key === 'soft_office');
        const mLink = sData.find(s => s.key === 'soft_pmas');
        if (pLink) links.proteus = pLink.value;
        if (oLink) links.office = oLink.value;
        if (mLink) links.pmas = mLink.value;
        setSoftwareLinks(links);

        const aPdf = sData.find(s => s.key === 'api_pdf_guide');
        if (aPdf) setApiPdfLink(aPdf.value);

        const oPdf = sData.find(s => s.key === 'opencode_pdf_guide');
        if (oPdf) setOpencodePdfLink(oPdf.value);

        const gAdmin = sData.find(s => s.key === 'groq_api_admin');
        if (gAdmin) setGroqApiAdmin(gAdmin.value);

        const gUser = sData.find(s => s.key === 'groq_api_user');
        if (gUser) setGroqApiUser(gUser.value);

        const mAdmin = sData.find(s => s.key === 'groq_model_admin');
        if (mAdmin) setGroqModelAdmin(mAdmin.value);

        const mUser = sData.find(s => s.key === 'groq_model_user');
        if (mUser) setGroqModelUser(mUser.value);
      }
    } catch (err) {
      console.error('Erreur chargement données:', err);
    }
  }

  // ─── AJOUT PRODUIT ───
  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('products').insert([{
      ...newProduct,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock)
    }]);
    if (!error) {
      setNewProduct({ name: '', price: '', stock: '0', category: 'Electronique', description: '', image_url: '' });
      loadAllData();
    } else {
      alert(error.message);
    }
    setLoading(false);
  }

  // ─── SUPPRESSION PRODUIT ───
  async function deleteProduct(id: string) {
    if (!confirm('Supprimer ce produit ?')) return;
    await supabase.from('products').delete().eq('id', id);
    loadAllData();
  }

  // ─── TUTORIELS ───
  async function handleAddTutorial(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const slug = newTutorial.slug || newTutorial.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await supabase.from('tutorials').insert([{ ...newTutorial, slug, published: newTutorial.published }]);
    setNewTutorial({ title: '', slug: '', description: '', category: 'Electronique', published: false });
    loadAllData();
    setLoading(false);
  }
  async function deleteTutorial(id: string) {
    if (!confirm('Supprimer ce tutoriel ?')) return;
    await supabase.from('tutorials').delete().eq('id', id);
    loadAllData();
  }
  async function toggleTutorial(id: string, current: boolean) {
    await supabase.from('tutorials').update({ published: !current }).eq('id', id);
    loadAllData();
  }

  // ─── MESSAGES ───
  async function deleteMessage(id: string) {
    if (!confirm('Supprimer ce message ?')) return;
    await supabase.from('contact_messages').delete().eq('id', id);
    loadAllData();
  }
  async function markMessageRead(id: string) {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
    loadAllData();
  }

  // ─── COMMANDES : changer le statut ───
  async function updateOrderStatus(id: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', id);
    loadAllData();
  }

  // ─── ÉCRAN DE CHARGEMENT ───
  if (checking) {
    return (
      <div className="admin-login">
        <div className="admin-login-card card" style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--clr-muted)' }}>Vérification...</p>
        </div>
      </div>
    );
  }

  // ─── FORMULAIRE DE CONNEXION ADMIN ───
  if (!session || !isAdmin) {
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
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="admin@tech-geo.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {loginError && (
              <div style={{
                padding: '0.75rem',
                background: 'rgba(255, 71, 87, 0.1)',
                border: '1px solid #ff4757',
                borderRadius: 'var(--radius)',
                color: '#ff4757',
                fontSize: '0.875rem',
                textAlign: 'center',
                marginBottom: '1rem'
              }}>
                {loginError}
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={loginLoading} style={{ width: '100%', justifyContent: 'center' }}>
              {loginLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link href="/" style={{ color: 'var(--clr-muted)', fontSize: '0.85rem' }}>← Retour au site</Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── TABLEAU DE BORD ADMIN ───
  const navItems: { id: Panel; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
    { id: 'products', label: 'Produits', icon: '📦' },
    { id: 'tutorials', label: 'Tutoriels', icon: '📚' },
    { id: 'software', label: 'Logiciels', icon: '💻' },
    { id: 'api', label: 'API & Dev', icon: '🔌' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'orders', label: 'Commandes', icon: '🛒' },
    { id: 'messages', label: 'Messages', icon: '✉️' },
    { id: 'users', label: 'Utilisateurs', icon: '👥' },
    { id: 'assistant', label: 'Assistant IA', icon: '🤖' },
    { id: 'settings', label: 'Paramètres', icon: '⚙️' },
  ];

  return (
    <div className="admin-layout">
      <div className={`admin-sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-logo">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Tech‑Geo</h2>
            <button className="close-sidebar-btn mobile-only" onClick={() => setIsSidebarOpen(false)}>✕</button>
          </div>
          <p>Administration</p>
        </div>
        <nav className="admin-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`admin-nav-item ${panel === item.id ? 'active' : ''}`}
              onClick={() => {
                setPanel(item.id);
                setIsSidebarOpen(false);
              }}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
          
          <div 
            className="admin-nav-item" 
            onClick={handleLogout} 
            style={{ 
              marginTop: '3rem', 
              borderTop: '1px solid rgba(255,255,255,0.1)', 
              paddingTop: '1rem', 
              color: '#ff4757', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <span className="icon">🚪</span> Déconnexion
          </div>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <h1>{navItems.find(n => n.id === panel)?.label}</h1>
          </div>
          {!isSidebarOpen && (
            <button 
              className="hamburger-btn" 
              onClick={() => setIsSidebarOpen(true)}
            >
              ☰
            </button>
          )}
          <div className="admin-user">
            <div className="admin-avatar">{session.user?.email?.charAt(0).toUpperCase()}</div>
            <span>{session.user?.email}</span>
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
              <div className="stat-card card">
                <div className="stat-card-icon">📚</div>
                <div>
                  <div className="stat-card-value">{stats.tutorials}</div>
                  <div className="stat-card-label">Tutoriels</div>
                </div>
              </div>
              <div className="stat-card card">
                <div className="stat-card-icon">👥</div>
                <div>
                  <div className="stat-card-value">{stats.users}</div>
                  <div className="stat-card-label">Utilisateurs</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {panel === 'products' && (
          <div className="admin-panel active">
            <div className="admin-section">
              <h3>Ajouter un produit</h3>
              <form onSubmit={handleAddProduct} className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nom du produit</label>
                    <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Prix (FCFA)</label>
                    <input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Stock</label>
                    <input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Catégorie</label>
                    <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                      <option>Electronique</option>
                      <option>Composants</option>
                      <option>Informatique</option>
                      <option>Arduino</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>URL de l&apos;image</label>
                  <input type="text" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} placeholder="https://..." />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Ajout...' : 'Ajouter le produit'}
                </button>
              </form>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Prix</th>
                    <th>Stock</th>
                    <th>Catégorie</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--clr-muted)', padding: '2rem' }}>Aucun produit</td></tr>
                  ) : products.map(p => (
                    <tr key={p.id}>
                      <td data-label="Produit">{p.name}</td>
                      <td data-label="Prix">{Number(p.price).toLocaleString()} FCFA</td>
                      <td data-label="Stock">{p.stock}</td>
                      <td data-label="Catégorie">{p.category}</td>
                      <td data-label="Actions" className="actions">
                        <button className="table-action-btn danger" onClick={() => deleteProduct(p.id)}>Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {panel === 'orders' && (
          <div className="admin-panel active">
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Total</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--clr-muted)', padding: '2rem' }}>Aucune commande</td></tr>
                  ) : orders.map(o => (
                    <tr key={o.id}>
                      <td data-label="ID">#{o.id.slice(0, 8)}</td>
                      <td data-label="Client">{o.customer?.name || 'Client'}</td>
                      <td data-label="Total">{Number(o.total).toLocaleString()} FCFA</td>
                      <td data-label="Statut">
                        <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                          style={{ padding: '0.3rem', borderRadius: '6px', background: 'var(--clr-surface)', color: 'var(--clr-text)', border: '1px solid var(--clr-border)' }}>
                          <option value="pending">En attente</option>
                          <option value="processing">En cours</option>
                          <option value="shipped">Expédié</option>
                          <option value="delivered">Livré</option>
                          <option value="cancelled">Annulé</option>
                        </select>
                      </td>
                      <td data-label="Date">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td data-label="Paiement">{o.payment_status || 'non payé'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {panel === 'tutorials' && (
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
        )}

        {panel === 'messages' && (
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
        )}

        {panel === 'users' && (
          <div className="admin-panel active">
            <div className="admin-table-container">
              <table className="admin-table">
                <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Inscrit le</th></tr></thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--clr-muted)', padding: '2rem' }}>Aucun utilisateur</td></tr>
                  ) : users.map(u => (
                    <tr key={u.id}>
                      <td>{u.name || '—'}</td>
                      <td>{u.email}</td>
                      <td><span style={{ color: u.role === 'admin' ? '#ffa502' : 'var(--clr-text)' }}>{u.role}</span></td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {panel === 'software' && (
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
        )}

        {panel === 'api' && (
          <div className="admin-panel active">
            <div className="admin-section">
              <h3>Configuration API & Guide</h3>
              <p style={{ color: 'var(--clr-muted)', marginBottom: '1.5rem' }}>Gérez les ressources pour les développeurs et le guide PDF.</p>
              
              <div className="card" style={{ padding: '1.5rem', display: 'grid', gap: '2rem' }}>
                {/* Assistant PDF */}
                <div className="form-group">
                  <label style={{ fontWeight: 'bold', color: 'var(--clr-accent)' }}>1. Guide Assistant Personnel (PDF)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <input 
                      type="text" 
                      value={apiPdfLink} 
                      onChange={e => setApiPdfLink(e.target.value)} 
                      placeholder="Lien du guide..." 
                      className="admin-input"
                    />
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px dashed var(--clr-border)' }}>
                      <input 
                        type="file" 
                        accept=".pdf" 
                        id="assistant-upload"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setLoading(true);
                          try {
                            const fileName = `guides/assistant-${Date.now()}.pdf`;
                            await supabase.storage.from('media').upload(fileName, file);
                            const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
                            setApiPdfLink(publicUrl);
                            await supabase.from('site_settings').upsert({ key: 'api_pdf_guide', value: publicUrl }, { onConflict: 'key' });
                            alert('Guide Assistant mis à jour !');
                          } catch (err: any) { alert(err.message); } finally { setLoading(false); }
                        }}
                      />
                      <label htmlFor="assistant-upload" className="btn btn-outline" style={{ cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
                        📁 {loading ? 'Envoi...' : 'Uploader Guide Assistant'}
                      </label>
                    </div>
                  </div>
                </div>

                {/* OpenCode PDF */}
                <div className="form-group">
                  <label style={{ fontWeight: 'bold', color: '#4caf50' }}>2. Guide OpenCode (PDF)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <input 
                      type="text" 
                      value={opencodePdfLink} 
                      onChange={e => setOpencodePdfLink(e.target.value)} 
                      placeholder="Lien du guide OpenCode..." 
                      className="admin-input"
                    />
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px dashed var(--clr-border)' }}>
                      <input 
                        type="file" 
                        accept=".pdf" 
                        id="opencode-upload"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setLoading(true);
                          try {
                            const fileName = `guides/opencode-${Date.now()}.pdf`;
                            await supabase.storage.from('media').upload(fileName, file);
                            const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
                            setOpencodePdfLink(publicUrl);
                            await supabase.from('site_settings').upsert({ key: 'opencode_pdf_guide', value: publicUrl }, { onConflict: 'key' });
                            alert('Guide OpenCode mis à jour !');
                          } catch (err: any) { alert(err.message); } finally { setLoading(false); }
                        }}
                      />
                      <label htmlFor="opencode-upload" className="btn btn-outline" style={{ cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
                        📁 {loading ? 'Envoi...' : 'Uploader Guide OpenCode'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
                <h4 style={{ color: 'var(--clr-accent)', marginBottom: '1rem' }}>🤖 Configuration API Groq (Assistant IA)</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--clr-muted)', marginBottom: '1.5rem' }}>Définissez les clés API pour propulser l'assistant. L'API Groq est ultra-rapide. Obtenez une clé sur <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0abde3' }}>console.groq.com</a>.</p>
                <div style={{ display: 'grid', gap: '2rem' }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Clé API Admin (Pour votre tableau de bord)</label>
                    <input 
                      type="password" 
                      value={groqApiAdmin} 
                      onChange={e => setGroqApiAdmin(e.target.value)} 
                      placeholder="gsk_..." 
                      className="admin-input"
                    />
                    <select 
                      value={groqModelAdmin} 
                      onChange={e => setGroqModelAdmin(e.target.value)}
                      className="admin-input"
                      style={{ marginTop: '0.5rem' }}
                    >
                      <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile (Recommandé)</option>
                      <option value="llama3-70b-8192">Llama 3 70B</option>
                      <option value="llama3-8b-8192">Llama 3 8B (Rapide)</option>
                      <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                      <option value="gemma2-9b-it">Gemma 2 9B</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Clé API Clients (Pour l'espace utilisateur)</label>
                    <input 
                      type="password" 
                      value={groqApiUser} 
                      onChange={e => setGroqApiUser(e.target.value)} 
                      placeholder="gsk_..." 
                      className="admin-input"
                    />
                    <select 
                      value={groqModelUser} 
                      onChange={e => setGroqModelUser(e.target.value)}
                      className="admin-input"
                      style={{ marginTop: '0.5rem' }}
                    >
                      <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile (Recommandé)</option>
                      <option value="llama3-70b-8192">Llama 3 70B</option>
                      <option value="llama3-8b-8192">Llama 3 8B (Rapide)</option>
                      <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                      <option value="gemma2-9b-it">Gemma 2 9B</option>
                    </select>
                  </div>
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ marginTop: '1.5rem' }}
                  onClick={async () => {
                    await supabase.from('site_settings').upsert([
                      { key: 'groq_api_admin', value: groqApiAdmin },
                      { key: 'groq_api_user', value: groqApiUser },
                      { key: 'groq_model_admin', value: groqModelAdmin },
                      { key: 'groq_model_user', value: groqModelUser }
                    ], { onConflict: 'key' });
                    alert('Clés et Modèles Groq enregistrés avec succès !');
                  }}
                >
                  💾 Enregistrer les clés Groq
                </button>
              </div>

              <div className="admin-table-container" style={{ marginTop: '2rem' }}>
                <h4>Statut des Services</h4>
                <table className="admin-table">
                  <thead>
                    <tr><th>Service</th><th>Status</th><th>Dernière activité</th></tr>
                  </thead>
                  <tbody>
                    <tr><td data-label="Service">Supabase Auth</td><td data-label="Status"><span style={{ color: '#4caf50' }}>Connecté</span></td><td data-label="Dernière activité">Il y a 2 min</td></tr>
                    <tr><td data-label="Service">Stripe API</td><td data-label="Status"><span style={{ color: 'var(--clr-muted)' }}>Non configuré</span></td><td data-label="Dernière activité">-</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {panel === 'business' && (
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
                  <input 
                    type="text" 
                    value={hiveqashLink} 
                    onChange={(e) => setHiveqashLink(e.target.value)}
                    placeholder="https://www.hiveqash.com/register?ref=votre_id"
                    style={{ flex: 1 }}
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={async () => {
                      const { error } = await supabase.from('site_settings').upsert({ key: 'hiveqash_link', value: hiveqashLink }, { onConflict: 'key' });
                      if (!error) alert('Lien mis à jour !');
                    }}
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {panel === 'assistant' && (
          <div className="admin-panel active">
            <AdminAssistant role="admin" />
          </div>
        )}

        {panel === 'settings' && (
          <div className="admin-panel active">
            <div className="admin-section">
              <h3>Informations du site</h3>
              <p style={{ color: 'var(--clr-muted)', marginBottom: '1rem' }}>Email connecté : <strong>{session.user?.email}</strong></p>
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
              <button className="btn btn-primary" onClick={loadAllData} style={{ marginTop: '1.5rem' }}>🔄 Rafraîchir les données</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
