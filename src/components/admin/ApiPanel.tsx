'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';

interface ApiPanelProps {
  apiPdfLink: string;
  opencodePdfLink: string;
  groqApiAdmin: string;
  groqApiUser: string;
  groqModelAdmin: string;
  groqModelUser: string;
}

export default function ApiPanel(props: ApiPanelProps) {
  const supabase = getSupabase();
  const [loading, setLoading] = useState(false);
  const [apiPdfLink, setApiPdfLink] = useState(props.apiPdfLink);
  const [opencodePdfLink, setOpencodePdfLink] = useState(props.opencodePdfLink);
  const [groqApiAdmin, setGroqApiAdmin] = useState(props.groqApiAdmin);
  const [groqApiUser, setGroqApiUser] = useState(props.groqApiUser);
  const [groqModelAdmin, setGroqModelAdmin] = useState(props.groqModelAdmin);
  const [groqModelUser, setGroqModelUser] = useState(props.groqModelUser);

  return (
    <div className="admin-panel active">
      <div className="admin-section">
        <h3>Configuration API & Guide</h3>
        <p style={{ color: 'var(--clr-muted)', marginBottom: '1.5rem' }}>Gérez les ressources pour les développeurs et le guide PDF.</p>

        <div className="card" style={{ padding: '1.5rem', display: 'grid', gap: '2rem' }}>
          <div className="form-group">
            <label style={{ fontWeight: 'bold', color: 'var(--clr-accent)' }}>1. Guide Assistant Personnel (PDF)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input type="text" value={apiPdfLink} onChange={e => setApiPdfLink(e.target.value)} placeholder="Lien du guide..." className="admin-input" />
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px dashed var(--clr-border)' }}>
                <input type="file" accept=".pdf" id="assistant-upload" style={{ display: 'none' }}
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

          <div className="form-group">
            <label style={{ fontWeight: 'bold', color: '#4caf50' }}>2. Guide OpenCode (PDF)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input type="text" value={opencodePdfLink} onChange={e => setOpencodePdfLink(e.target.value)} placeholder="Lien du guide OpenCode..." className="admin-input" />
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px dashed var(--clr-border)' }}>
                <input type="file" accept=".pdf" id="opencode-upload" style={{ display: 'none' }}
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
          <p style={{ fontSize: '0.85rem', color: 'var(--clr-muted)', marginBottom: '1.5rem' }}>Définissez les clés API pour propulser l&apos;assistant. L&apos;API Groq est ultra-rapide. Obtenez une clé sur <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0abde3' }}>console.groq.com</a>.</p>
          <div style={{ display: 'grid', gap: '2rem' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Clé API Admin (Pour votre tableau de bord)</label>
              <input type="password" value={groqApiAdmin} onChange={e => setGroqApiAdmin(e.target.value)} placeholder="gsk_..." className="admin-input" />
              <select value={groqModelAdmin} onChange={e => setGroqModelAdmin(e.target.value)} className="admin-input" style={{ marginTop: '0.5rem' }}>
                <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile (Recommandé)</option>
                <option value="llama3-70b-8192">Llama 3 70B</option>
                <option value="llama3-8b-8192">Llama 3 8B (Rapide)</option>
                <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                <option value="gemma2-9b-it">Gemma 2 9B</option>
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Clé API Clients (Pour l&apos;espace utilisateur)</label>
              <input type="password" value={groqApiUser} onChange={e => setGroqApiUser(e.target.value)} placeholder="gsk_..." className="admin-input" />
              <select value={groqModelUser} onChange={e => setGroqModelUser(e.target.value)} className="admin-input" style={{ marginTop: '0.5rem' }}>
                <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile (Recommandé)</option>
                <option value="llama3-70b-8192">Llama 3 70B</option>
                <option value="llama3-8b-8192">Llama 3 8B (Rapide)</option>
                <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                <option value="gemma2-9b-it">Gemma 2 9B</option>
              </select>
            </div>
          </div>
          <button
            className="btn btn-primary" style={{ marginTop: '1.5rem' }}
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
            <thead><tr><th>Service</th><th>Status</th><th>Dernière activité</th></tr></thead>
            <tbody>
              <tr><td data-label="Service">Supabase Auth</td><td data-label="Status"><span style={{ color: '#4caf50' }}>Connecté</span></td><td data-label="Dernière activité">Il y a 2 min</td></tr>
              <tr><td data-label="Service">Stripe API</td><td data-label="Status"><span style={{ color: 'var(--clr-muted)' }}>Non configuré</span></td><td data-label="Dernière activité">-</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
