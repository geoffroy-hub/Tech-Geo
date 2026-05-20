'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';

export default function SoftwarePage() {
  const [links, setLinks] = useState({ proteus: '#', office: '#', pmas: '#' });

  useEffect(() => {
    async function loadLinks() {
      const supabase = getSupabase();
      const { data } = await supabase.from('site_settings').select('key, value');
      if (data) {
        const pLink = data.find(s => s.key === 'soft_proteus');
        const oLink = data.find(s => s.key === 'soft_office');
        const mLink = data.find(s => s.key === 'soft_pmas');
        setLinks({
          proteus: pLink?.value || '#',
          office: oLink?.value || '#',
          pmas: mLink?.value || '#'
        });
      }
    }
    loadLinks();
  }, []);

  const softs = [
    {
      id: 'proteus',
      name: 'Proteus Design Suite',
      desc: 'Conception de montages électroniques : simulation et création de circuits avancés et de PCB.',
      img: '/images/Logicielles/proteus.webp',
      link: links.proteus
    },
    {
      id: 'office',
      name: 'Simple Installeur Office',
      desc: 'Installez toutes les versions d\'Office (de 2013 à 365) en quelques clics grâce à ce logiciel.',
      img: '/images/Logicielles/office.webp',
      link: links.office
    },
    {
      id: 'pmas',
      name: 'PMAS Activator',
      desc: 'Solution d\'activation pour Windows et Office : garantissez la conformité de votre système.',
      img: '/images/Logicielles/activateur.webp',
      link: links.pmas
    }
  ];

  return (
    <div className="software-page">
      <section className="hero-sm" style={{ background: 'linear-gradient(135deg, #051c24 0%, #003c57 100%)' }}>
        <div className="container">
          <h1 className="fade-in">Bibliothèque de Logiciels</h1>
          <p className="fade-in" style={{ animationDelay: '0.1s' }}>Téléchargez les outils essentiels pour vos projets techniques et bureautiques.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            {softs.map((soft) => (
              <div key={soft.id} className="card hover-lift" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '400px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={soft.img} 
                    alt={soft.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                   loading="lazy" decoding="async"/>
                </div>
                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--clr-accent)' }}>{soft.name}</h3>
                  <p style={{ color: 'var(--clr-muted)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {soft.desc}
                  </p>
                  <div style={{ marginTop: 'auto' }}>
                    <a 
                      href={soft.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary" 
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      ⬇️ Télécharger maintenant
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
