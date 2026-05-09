'use client';

import { useState } from 'react';
import Link from 'next/link';

const TUTORIALS = [
  { id: 'intro-electronique', slug: 'introduction-electronique', title: 'Introduction à l\'électronique', category: 'électronique', image: '/images/tutorial-photos/transistor.jpg', duration: '20 min', description: 'Découvrez les composants de base : résistances, condensateurs, diodes et transistors.' },
  { id: 'arduino-bien-coder', slug: 'arduino-bien-coder', title: 'Bien coder avec Arduino', category: 'électronique', image: '/images/tutorial-photos/Arduino Bluetooth Car Building 🛠.jpg', duration: '15 min', description: 'Conventions de nommage, indentation, commentaires et bonnes pratiques.' },
  { id: 'kicad-pcb', slug: 'kicad-pcb', title: 'Conception de circuits PCB', category: 'électronique', image: '/images/tutorial-photos/technical-schematic-diagram-analog-electronic-260nw-2505467983.jpg', duration: '45 min', description: 'Apprenez à utiliser KiCad pour transformer vos schémas en circuits imprimés.' },
  { id: 'html-css-modernes', slug: 'html-css-modernes', title: 'HTML & CSS modernes', category: 'informatique', image: '/images/tutorial-photos/top-view-diverse-group-people-600nw-2757624093.jpg', duration: '30 min', description: 'Maîtrisez Flexbox, Grid et les variables CSS pour des sites responsive.' },
];

const TUTORIAL_CONTENT: Record<string, { title: string; sections: { id: string; title: string; content: string }[] }> = {
  'introduction-electronique': {
    title: 'Introduction à l\'électronique',
    sections: [
      { id: 'intro', title: 'Introduction', content: "L'électronique est la science qui étudie le déplacement des électrons dans des circuits. Pour créer des systèmes complexes, on utilise des briques élémentaires : les composants électroniques." },
      { id: 'resistance', title: 'La Résistance', content: "Comme son nom l'indique, la résistance 'résiste' au passage du courant. Elle permet de limiter l'intensité dans un circuit pour protéger d'autres composants comme les LED." },
      { id: 'condensateur', title: 'Le Condensateur', content: "Le condensateur agit comme un petit réservoir d'énergie. Il peut se charger et se décharger très rapidement. On l'utilise souvent pour stabiliser une tension ou filtrer des signaux." },
      { id: 'diode', title: 'La Diode', content: "La diode est un composant qui ne laisse passer le courant que dans un seul sens. C'est l'équivalent d'un clapet anti-retour dans une canalisation d'eau." },
      { id: 'transistor', title: 'Le Transistor', content: "Le transistor est le composant le plus important de l'électronique moderne. Il peut agir comme un interrupteur ou comme un amplificateur. C'est la brique de base des processeurs." },
    ],
  },
  'arduino-bien-coder': {
    title: 'Arduino — Bien coder',
    sections: [
      { id: 'intro', title: 'Introduction', content: "L'utilisation d'un langage de programmation passe par l'apprentissage d'un vocabulaire et d'une syntaxe précise. Un code clair offre une meilleure lecture, qu'il s'agisse de modifier ses configurations ou de localiser la source d'une erreur." },
      { id: 'nommage', title: 'Conventions de nommage', content: "La syntaxe d'un langage de programmation se base généralement sur une convention de nommage. Il est important de respecter cette nomenclature pour rester dans l'esthétique du code." },
      { id: 'indentation', title: 'Indenter son code', content: "Il est conseillé d'effectuer un retrait par rapport à la ligne précédente à chaque nouveau bloc d'instructions. Les blocs d'instructions inscrits dans les fonctions et boucles sont délimités par des accolades." },
      { id: 'commentaires', title: 'Faire des commentaires', content: "Les commentaires permettent de se retrouver dans son code et facilitent la compréhension pour ceux qui en auront besoin." },
    ],
  },
  'kicad-pcb': {
    title: 'Conception de circuits PCB',
    sections: [
      { id: 'schema', title: 'Saisie du schéma', content: "Tout commence par le schéma. C'est ici que vous définissez les connexions logiques entre vos composants." },
      { id: 'empreintes', title: 'Assignation des empreintes', content: "Chaque composant symbolique doit être relié à une 'empreinte' (footprint) physique qui correspond à sa taille réelle sur la carte." },
      { id: 'routage', title: 'Routage des pistes', content: "C'est l'étape la plus créative : placer les composants sur la carte et tracer les pistes de cuivre qui les relient." },
      { id: 'fabrication', title: 'Export pour fabrication', content: "Une fois le design terminé, on génère des fichiers 'Gerber' qui sont envoyés aux usines de fabrication de PCB." },
    ],
  },
  'html-css-modernes': {
    title: 'HTML & CSS modernes',
    sections: [
      { id: 'html5', title: 'Structure HTML5', content: "L'utilisation de balises sémantiques comme <header>, <main>, <footer> et <section> est essentielle pour le SEO et l'accessibilité." },
      { id: 'flexbox', title: 'Le module Flexbox', content: "Flexbox est idéal pour aligner des éléments dans une seule dimension (ligne ou colonne). C'est l'outil parfait pour les barres de navigation et les composants simples." },
      { id: 'grid', title: 'CSS Grid Layout', content: "Grid permet de concevoir des mises en page en deux dimensions (lignes ET colonnes). C'est la solution ultime pour les structures de pages complexes." },
      { id: 'variables', title: 'Variables CSS', content: "Les propriétés personnalisées (variables) permettent de centraliser les couleurs et les dimensions, facilitant ainsi la maintenance et l'implémentation du mode sombre." },
    ],
  },
};

export default function TutorialsPage() {
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('tab-electronique');

  const filtered = filter === 'all'
    ? TUTORIALS.filter(t => t.category !== 'video')
    : filter === 'video'
      ? TUTORIALS.filter(t => t.category === 'video')
      : TUTORIALS.filter(t => t.category === filter);

  const slugToTab: Record<string, string> = {
    'introduction-electronique': 'tab-electronique',
    'arduino-bien-coder': 'tab-arduino',
    'kicad-pcb': 'tab-kicad',
    'html-css-modernes': 'tab-web',
  };

  const tabSlugs = ['tab-electronique', 'tab-arduino', 'tab-kicad', 'tab-web'];
  const tabTitles = ['Introduction Électronique', 'Arduino — Bien coder', 'KiCad PCB', 'HTML & CSS modernes'];
  const tabIcons = ['⚡', '🔌', '🔍', '💻'];
  const tabBadges = ['20 min', '15 min', '45 min', '30 min'];
  const tabContentSlugs = ['introduction-electronique', 'arduino-bien-coder', 'kicad-pcb', 'html-css-modernes'];

  return (
    <>
      <section className="hero-sm" style={{ backgroundImage: 'url(/images/tutorial-photos/top-view-wires-tech-background.jpg)' }}>
        <div className="container">
          <h1>Tutoriels</h1>
          <p>Des guides pratiques pour maîtriser l&apos;électronique et l&apos;informatique, étape par étape.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Sélectionnez un tutoriel</h2>
          <div className="tutorial-categories" style={{ marginBottom: '2rem' }}>
            {['all', 'électronique', 'informatique', 'robotique', 'video'].map(cat => (
              <button key={cat} className={`filter-btn ripple ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
                {cat === 'all' ? 'Tous' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid-3" id="tutorials-grid">
            {filtered.map(tutorial => (
              <div key={tutorial.id} className="tutorial-card-wrapper" style={{ position: 'relative' }}>
                <a href={`#${slugToTab[tutorial.slug]}`} className="tutorial-card card hover-lift"
                  onClick={(e) => { e.preventDefault(); setActiveTab(slugToTab[tutorial.slug]); }}>
                  <div className="tutorial-thumbnail">
                    <img src={tutorial.image} alt={tutorial.title} loading="eager" />
                    <div className="tutorial-thumbnail-overlay"></div>
                    <span className="tutorial-duration">{tutorial.duration}</span>
                  </div>
                  <div className="tutorial-body">
                    <h3>{tutorial.title}</h3>
                    <p>{tutorial.description}</p>
                    <div className="tutorial-meta">
                      <div className="tutorial-author">
                        <div className="author-avatar">T</div>
                        <span>Tech-Geo</span>
                      </div>
                      <span>{tutorial.category}</span>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="tutorial-content" style={{ background: 'rgba(0,60,87,0.15)' }}>
        <div className="container">
          <h2 className="section-title">Contenu des tutoriels</h2>

          <div className="tutorial-tabs">
            <div className="tutorial-tabs-header" role="tablist">
              {tabSlugs.map((slug, i) => (
                <button
                  key={slug}
                  className={`tutorial-tab-btn ${activeTab === slug ? 'active' : ''}`}
                  onClick={() => setActiveTab(slug)}
                  role="tab"
                  aria-selected={activeTab === slug}
                >
                  <span className="tab-icon">{tabIcons[i]}</span>
                  {tabTitles[i]}
                  <span className="tab-badge">{tabBadges[i]}</span>
                </button>
              ))}
            </div>

            {tabContentSlugs.map((contentSlug, i) => {
              const content = TUTORIAL_CONTENT[contentSlug];
              return (
                <div key={tabSlugs[i]} className={`tutorial-tab-panel ${activeTab === tabSlugs[i] ? 'active' : ''}`} role="tabpanel">
                  <div className="tutorial-detail">
                    <div className="container">
                      <div className="tutorial-content">
                        <h1>{content?.title}</h1>
                        {content?.sections.map(section => (
                          <div key={section.id}>
                            <h2 id={section.id}>{section.title}</h2>
                            <p>{section.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
