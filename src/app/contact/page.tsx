'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import NewsletterForm from '@/components/NewsletterForm';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('contact_messages').insert([{
        name: form.name,
        email: form.email,
        message: form.message
      }]);
      if (error) throw error;
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const contactInfo = [
    { title: 'Adresse', value: 'Lomé, Togo', icon: '📍' },
    { title: 'Email', value: 'contact@tech-geo.vercel.app', icon: '✉️' },
    { title: 'Téléphone', value: '+228 71 03 01 88', icon: '📞' },
    { title: 'Horaires', value: 'Lun - Ven: 8h - 18h\nSam: 9h - 13h', icon: '🕒' },
  ];

  return (
    <>
      <section className="hero-sm" style={{ backgroundImage: 'url(/images/tutorial-photos/various-radio-components-soldering-iron-600nw-2695650513.webp)' }}>
        <div className="container">
          <h1>Contactez-nous</h1>
          <p>Une question, une suggestion ou un projet en tête ? N&apos;hésitez pas à nous écrire.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-form-container">
              <form onSubmit={handleSubmit} className="contact-form">
                <h2>Envoyez-nous un message</h2>
                <div className="form-group">
                  <label>Nom complet</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Votre nom" required />
                </div>
                <div className="form-group">
                  <label>Adresse email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="votre@email.com" required />
                </div>
                <div className="form-group">
                  <label>Votre message</label>
                  <textarea rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Votre message..." required></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={status === 'loading'} style={{ width: '100%' }}>
                  {status === 'loading' ? 'Envoi...' : 'Envoyer le message'}
                </button>
                {status === 'success' && <div className="form-success show">Message envoyé avec succès !</div>}
                {status === 'error' && <div className="auth-error show">Erreur lors de l&apos;envoi du message.</div>}
              </form>
            </div>

            <div className="contact-info">
              {contactInfo.map(info => (
                <div key={info.title} className="contact-info-card">
                  <div className="contact-info-icon">{info.icon}</div>
                  <div className="contact-info-text">
                    <h3>{info.title}</h3>
                    <p style={{ whiteSpace: 'pre-line' }}>{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126848.97232264634!2d1.139417835156251!3d6.136616400000008!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x102159196b05615f%3A0xc33a61d102e3b976!2sLom%C3%A9!5e0!3m2!1sfr!2stg!4v1700000000000!5m2!1sfr!2stg"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      <section className="section" style={{ borderTop: '1px solid var(--clr-teal)' }}>
        <div className="container text-center">
          <h2>Rejoignez l&apos;aventure</h2>
          <p className="mb-4">Inscrivez-vous à notre newsletter pour recevoir les derniers tutoriels et nouveaux produits en avant-première.</p>
          <NewsletterForm buttonText="S'abonner" />
        </div>
      </section>
    </>
  );
}

