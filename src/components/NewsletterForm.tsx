'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';

export default function NewsletterForm({ style, inputStyle, buttonText = "S'inscrire" }: { style?: React.CSSProperties; inputStyle?: React.CSSProperties; buttonText?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('newsletter_subscribers').insert([{ email }]);
      if (error) throw error;
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return <p style={{ color: '#2ed573', fontSize: '0.85rem' }}>✓ Inscrit avec succès !</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', ...style }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="votre@email.com"
        required
        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--clr-border)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'inherit', ...inputStyle }}
      />
      <button type="submit" className="btn btn-primary" disabled={status === 'loading'} style={{ justifyContent: 'center' }}>
        {status === 'loading' ? '...' : buttonText}
      </button>
      {status === 'error' && <p style={{ color: '#ff4757', fontSize: '0.8rem', margin: 0, alignSelf: 'center' }}>Erreur d'inscription</p>}
    </form>
  );
}
