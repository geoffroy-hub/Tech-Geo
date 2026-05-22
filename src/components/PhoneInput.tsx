'use client';

import { useState } from 'react';

const AFRICAN_COUNTRIES = [
  { code: 'TG', dial: '+228', flag: '🇹🇬', name: 'Togo' },
  { code: 'BJ', dial: '+229', flag: '🇧🇯', name: 'Bénin' },
  { code: 'GH', dial: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: 'CI', dial: '+225', flag: '🇨🇮', name: "Côte d'Ivoire" },
  { code: 'SN', dial: '+221', flag: '🇸🇳', name: 'Sénégal' },
  { code: 'ML', dial: '+223', flag: '🇲🇱', name: 'Mali' },
  { code: 'BF', dial: '+226', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: 'GN', dial: '+224', flag: '🇬🇳', name: 'Guinée' },
  { code: 'NE', dial: '+227', flag: '🇳🇪', name: 'Niger' },
  { code: 'CM', dial: '+237', flag: '🇨🇲', name: 'Cameroun' },
  { code: 'NG', dial: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: 'MA', dial: '+212', flag: '🇲🇦', name: 'Maroc' },
  { code: 'DZ', dial: '+213', flag: '🇩🇿', name: 'Algérie' },
  { code: 'TN', dial: '+216', flag: '🇹🇳', name: 'Tunisie' },
  { code: 'EG', dial: '+20',  flag: '🇪🇬', name: 'Égypte' },
  { code: 'ZA', dial: '+27',  flag: '🇿🇦', name: 'Afrique du Sud' },
  { code: 'KE', dial: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: 'ET', dial: '+251', flag: '🇪🇹', name: 'Éthiopie' },
  { code: 'TZ', dial: '+255', flag: '🇹🇿', name: 'Tanzanie' },
  { code: 'UG', dial: '+256', flag: '🇺🇬', name: 'Ouganda' },
  { code: 'CD', dial: '+243', flag: '🇨🇩', name: 'RD Congo' },
  { code: 'CG', dial: '+242', flag: '🇨🇬', name: 'Congo' },
  { code: 'GA', dial: '+241', flag: '🇬🇦', name: 'Gabon' },
  { code: 'SL', dial: '+232', flag: '🇸🇱', name: 'Sierra Leone' },
  { code: 'LR', dial: '+231', flag: '🇱🇷', name: 'Libéria' },
  { code: 'MR', dial: '+222', flag: '🇲🇷', name: 'Mauritanie' },
  { code: 'GM', dial: '+220', flag: '🇬🇲', name: 'Gambie' },
  { code: 'GW', dial: '+245', flag: '🇬🇼', name: 'Guinée-Bissau' },
  { code: 'CV', dial: '+238', flag: '🇨🇻', name: 'Cap-Vert' },
  { code: 'MG', dial: '+261', flag: '🇲🇬', name: 'Madagascar' },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

export default function PhoneInput({ value, onChange, required, placeholder }: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(AFRICAN_COUNTRIES[0]);
  const [localNumber, setLocalNumber] = useState('');

  const handleSelect = (country: typeof AFRICAN_COUNTRIES[0]) => {
    setSelected(country);
    setOpen(false);
    const newFull = country.dial + ' ' + localNumber;
    onChange(newFull);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/[^\d\s]/g, '');
    setLocalNumber(num);
    onChange(selected.dial + (num ? ' ' + num : ''));
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
      {/* Selector */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.75rem 0.75rem',
            background: 'var(--clr-deep)',
            border: '1px solid var(--clr-teal)',
            borderRadius: 'var(--radius)',
            color: 'var(--clr-white)',
            cursor: 'pointer',
            fontSize: '1rem',
            height: '100%',
            whiteSpace: 'nowrap',
          }}
        >
          <span>{selected.flag}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--clr-muted)' }}>{selected.dial}</span>
          <span style={{ fontSize: '0.7rem' }}>▼</span>
        </button>

        {open && (
          <div style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            zIndex: 999,
            background: '#0d2137',
            border: '1px solid var(--clr-teal)',
            borderRadius: 'var(--radius)',
            maxHeight: '260px',
            overflowY: 'auto',
            minWidth: '200px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            {AFRICAN_COUNTRIES.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => handleSelect(c)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  width: '100%',
                  padding: '0.6rem 1rem',
                  background: selected.code === c.code ? 'rgba(4,187,255,0.1)' : 'transparent',
                  border: 'none',
                  color: 'var(--clr-white)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textAlign: 'left',
                }}
              >
                <span>{c.flag}</span>
                <span style={{ flex: 1 }}>{c.name}</span>
                <span style={{ color: 'var(--clr-muted)', fontSize: '0.8rem' }}>{c.dial}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Number input */}
      <input
        type="text"
        inputMode="tel"
        value={localNumber}
        onChange={handleNumberChange}
        placeholder={placeholder || 'XX XX XX XX'}
        required={required}
        style={{ flex: 1 }}
      />
    </div>
  );
}
