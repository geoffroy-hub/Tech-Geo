'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) setQuery('');
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); onClose(); }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/boutique?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="search-box">
        <form className="search-input-wrap" onSubmit={handleSearch}>
          <span className="icon">&#128269;</span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Rechercher produits, tutoriels, pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <button type="button" className="search-close" onClick={onClose}>&times;</button>
        </form>
        <div className="search-results">
          <div className="search-empty">Commencez à taper pour rechercher...</div>
        </div>
        <div className="search-hint">
          <span><kbd>Ctrl</kbd> + <kbd>K</kbd> pour ouvrir</span>
          <span><kbd>Échap</kbd> pour fermer</span>
        </div>
      </div>
    </div>
  );
}
