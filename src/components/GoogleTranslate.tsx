'use client';

import { useEffect, useState } from 'react';

export default function GoogleTranslate() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  // Lire l'état depuis le cookie au montage
  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('googtrans='));
    if (cookie && cookie.includes('/fr/en')) {
      setLang('en');
    } else {
      setLang('fr');
    }
  }, []);

  // Charger Google Translate de façon différée — après que la page soit idle
  useEffect(() => {
    const loadTranslate = () => {
      if (document.getElementById('google-translate-script')) return;
      (window as any).googleTranslateElementInit = function () {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: 'fr', includedLanguages: 'en,fr', autoDisplay: false },
          'google_translate_element_hidden'
        );
      };
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    };

    // Charger après que le navigateur soit inactif (pas pendant le chargement de la page)
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(loadTranslate, { timeout: 3000 });
    } else {
      setTimeout(loadTranslate, 2000);
    }
  }, []);

  const switchTo = (target: 'fr' | 'en') => {
    setLang(target);
    const host = window.location.hostname;

    if (target === 'fr') {
      // Supprimer le cookie et recharger
      document.cookie = `googtrans=; path=/; domain=${host}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
      document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    } else {
      // Activer la traduction EN
      document.cookie = `googtrans=/fr/en; path=/; domain=${host}`;
      document.cookie = `googtrans=/fr/en; path=/`;
    }

    window.location.reload();
  };

  return (
    <>
      {/* Widget Google caché — requis pour initialiser le moteur de traduction */}
      <div
        id="google_translate_element_hidden"
        style={{ display: 'none', position: 'absolute', pointerEvents: 'none', visibility: 'hidden' }}
        aria-hidden="true"
      />

      {/* Bouton FR / EN custom */}
      <div className="lang-switcher" role="group" aria-label="Langue du site">
        <button
          className={`lang-btn${lang === 'fr' ? ' active' : ''}`}
          onClick={() => switchTo('fr')}
          aria-pressed={lang === 'fr'}
          title="Français"
        >
          FR
        </button>
        <span className="lang-sep" aria-hidden="true">|</span>
        <button
          className={`lang-btn${lang === 'en' ? ' active' : ''}`}
          onClick={() => switchTo('en')}
          aria-pressed={lang === 'en'}
          title="English"
        >
          EN
        </button>
      </div>
    </>
  );
}
