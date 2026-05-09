'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="section" style={{ paddingTop: '6rem' }}>
      <div className="container">
        <h1>Contactez-nous</h1>
        <p>Une question, une suggestion ? N&apos;hésitez pas à nous écrire.</p>
        <div style={{ maxWidth: 600, marginTop: '2rem' }}>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label>Nom complet</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Sujet</label>
              <input type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Envoi...' : 'Envoyer'}
            </button>
            {status === 'success' && <p style={{ color: 'green' }}>Message envoyé !</p>}
            {status === 'error' && <p style={{ color: 'red' }}>Erreur lors de l&apos;envoi.</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
