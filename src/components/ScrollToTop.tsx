'use client';

import { useState, useEffect } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(scrollY > 300);
      setScrollPct(docH > 0 ? Math.min(100, (scrollY / docH) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Cercle SVG
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (scrollPct / 100) * circ;

  return (
    <>
      <style>{`
        .stt-btn {
          position: fixed;
          bottom: 2rem;
          right: 1.5rem;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: none;
          background: var(--clr-surface, #0a2535);
          cursor: pointer;
          z-index: 8888;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, opacity 0.35s, visibility 0.35s;
        }
        .stt-btn.hidden {
          opacity: 0;
          visibility: hidden;
          transform: translateY(16px) scale(0.85);
          pointer-events: none;
        }
        .stt-btn.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }
        .stt-btn:hover {
          transform: translateY(-3px) scale(1.08) !important;
        }
        .stt-btn:active {
          transform: scale(0.95) !important;
        }
        .stt-ring-bg {
          stroke: rgba(4,187,255,0.15);
          fill: none;
          stroke-width: 2.5;
        }
        .stt-ring-prog {
          stroke: #04BBFF;
          fill: none;
          stroke-width: 2.5;
          stroke-linecap: round;
          transform: rotate(-90deg);
          transform-origin: center;
          transition: stroke-dasharray 0.2s ease;
        }
        .stt-arrow {
          stroke: #04BBFF;
          stroke-width: 2.2;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
          transition: transform 0.2s;
        }
        .stt-btn:hover .stt-arrow {
          transform: translateY(-1.5px);
        }
      `}</style>
      <button
        className={`stt-btn ${visible ? 'visible' : 'hidden'}`}
        onClick={scrollUp}
        aria-label="Retour en haut de la page"
        title="Retour en haut"
      >
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle className="stt-ring-bg" cx="26" cy="26" r={r} />
          <circle
            className="stt-ring-prog"
            cx="26" cy="26" r={r}
            strokeDasharray={`${dash} ${circ}`}
          />
          <polyline className="stt-arrow" points="19,28 26,20 33,28" />
          <line className="stt-arrow" x1="26" y1="20" x2="26" y2="33" />
        </svg>
      </button>
    </>
  );
}
