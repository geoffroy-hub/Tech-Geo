'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Product, Order, Tutorial } from '@/types';
import AdminAssistant from '@/components/AdminAssistant';
import LoginForm from '@/components/admin/LoginForm';
import DashboardPanel from '@/components/admin/DashboardPanel';
import ProductsPanel from '@/components/admin/ProductsPanel';
import OrdersPanel from '@/components/admin/OrdersPanel';
import TutorialsPanel from '@/components/admin/TutorialsPanel';
import MessagesPanel from '@/components/admin/MessagesPanel';
import UsersPanel from '@/components/admin/UsersPanel';
import SoftwarePanel from '@/components/admin/SoftwarePanel';
import ApiPanel from '@/components/admin/ApiPanel';
import BusinessPanel from '@/components/admin/BusinessPanel';
import SettingsPanel from '@/components/admin/SettingsPanel';
import PdfOrdersPanel from '@/components/admin/PdfOrdersPanel';

type Panel = 'dashboard' | 'products' | 'orders' | 'tutorials' | 'software' | 'api' | 'business' | 'messages' | 'users' | 'assistant' | 'settings' | 'pdforders';

export default function AdminPage() {
  const supabase = getSupabase();

  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  const [panel, setPanel] = useState<Panel>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, messages: 0, tutorials: 0, users: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [hiveqashLink, setHiveqashLink] = useState('https://www.hiveqash.com/');
  const [softwareLinks, setSoftwareLinks] = useState({ proteus: '', office: '', pmas: '' });
  const [apiPdfLink, setApiPdfLink] = useState('');
  const [opencodePdfLink, setOpencodePdfLink] = useState('');
  const [groqApiAdmin, setGroqApiAdmin] = useState('');
  const [groqApiUser, setGroqApiUser] = useState('');
  const [groqModelAdmin, setGroqModelAdmin] = useState('llama-3.3-70b-versatile');
  const [groqModelUser, setGroqModelUser] = useState('llama-3.3-70b-versatile');

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (s?.user) {
          setSession(s);
          const { data: prof } = await supabase.from('profiles').select('role').eq('id', s.user.id).single();
          setIsAdmin(prof?.role === 'admin');
        }
      } catch {}
      setChecking(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (isAdmin && session) loadAllData();
  }, [isAdmin]);

  async function handleLogout() {
    await supabase.auth.signOut();
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('sb-')) localStorage.removeItem(key);
    }
    setSession(null);
    setIsAdmin(false);
    window.location.href = '/';
  }

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

      const { data: sData } = await supabase.from('site_settings').select('key, value');
      if (sData) {
        const hLink = sData.find(s => s.key === 'hiveqash_link');
        if (hLink) setHiveqashLink(hLink.value);
        const pLink = sData.find(s => s.key === 'soft_proteus');
        const oLink = sData.find(s => s.key === 'soft_office');
        const mLink = sData.find(s => s.key === 'soft_pmas');
        if (pLink || oLink || mLink) setSoftwareLinks({
          proteus: pLink?.value || '',
          office: oLink?.value || '',
          pmas: mLink?.value || '',
        });
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

  if (!session || !isAdmin) {
    return <LoginForm onLogin={(s) => {
      setSession(s);
      setIsAdmin(true);
    }} />;
  }

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

  const renderPanel = () => {
    switch (panel) {
      case 'dashboard': return <DashboardPanel stats={stats} />;
      case 'products': return <ProductsPanel products={products} onRefresh={loadAllData} />;
      case 'orders': return <OrdersPanel orders={orders} onRefresh={loadAllData} />;
      case 'tutorials': return <TutorialsPanel tutorials={tutorials} onRefresh={loadAllData} />;
      case 'messages': return <MessagesPanel messages={messages} onRefresh={loadAllData} />;
      case 'users': return <UsersPanel users={users} />;
      case 'software': return <SoftwarePanel links={softwareLinks} onRefresh={loadAllData} />;
      case 'api': return <ApiPanel apiPdfLink={apiPdfLink} opencodePdfLink={opencodePdfLink} groqApiAdmin={groqApiAdmin} groqApiUser={groqApiUser} groqModelAdmin={groqModelAdmin} groqModelUser={groqModelUser} />;
      case 'business': return <BusinessPanel hiveqashLink={hiveqashLink} />;
      case 'assistant': return <div className="admin-panel active"><AdminAssistant role="admin" /></div>;
      case 'settings': return <SettingsPanel email={session?.user?.email || ''} stats={stats} onRefresh={loadAllData} />;
      case 'pdforders': return <PdfOrdersPanel />;
    }
  };

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
            <button key={item.id} className={`admin-nav-item ${panel === item.id ? 'active' : ''}`}
              onClick={() => { setPanel(item.id); setIsSidebarOpen(false); }}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <div className="admin-nav-item" onClick={handleLogout}
            style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', color: '#ff4757', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
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
            <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
          )}
          <div className="admin-user">
            <div className="admin-avatar">{session?.user?.email?.charAt(0).toUpperCase()}</div>
            <span>{session?.user?.email}</span>
          </div>
        </div>
        {renderPanel()}
      </main>
    </div>
  );
}
