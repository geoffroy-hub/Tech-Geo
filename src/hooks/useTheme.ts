'use client';

import { useState, useEffect, useCallback } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(true);

  const applyTheme = useCallback((dark: boolean) => {
    const root = document.documentElement;
    if (dark) {
      document.body.classList.remove('light-mode');
      root.setAttribute('data-theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      root.setAttribute('data-theme', 'light');
    }
  }, []);

  // On mount: read stored preference or default to dark
  useEffect(() => {
    const stored = localStorage.getItem('techgeo_theme');
    const dark = stored ? stored === 'dark' : true;
    setIsDark(dark);
    applyTheme(dark);
  }, [applyTheme]);

  const toggle = useCallback((event?: React.MouseEvent | MouseEvent) => {
    const updateTheme = () => {
      setIsDark(prev => {
        const next = !prev;
        applyTheme(next);
        localStorage.setItem('techgeo_theme', next ? 'dark' : 'light');
        return next;
      });
    };

    // No View Transitions support → instant switch
    if (
      typeof document.startViewTransition !== 'function' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      updateTheme();
      return;
    }

    // Position the bloom animation at click coordinates
    const x = event ? (event as MouseEvent).clientX : window.innerWidth / 2;
    const y = event ? (event as MouseEvent).clientY : window.innerHeight / 2;
    document.documentElement.style.setProperty('--x', `${x}px`);
    document.documentElement.style.setProperty('--y', `${y}px`);

    document.startViewTransition(updateTheme);
  }, [applyTheme]);

  return { isDark, toggle };
}
