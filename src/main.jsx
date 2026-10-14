import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Lokale Webfonts (frueher Google Fonts) — vor allen anderen Styles.
import './styles/fonts.css';
// Order matters: base.css holds the original <head> styles, patches.css the
// versioned override blocks that followed the markup. Same cascade as before.
import './styles/base.css';
import './styles/patches.css';
import './styles/phase2-polish.css';
import './styles/phase3-sections.css';
import './styles/phase4-premium.css';
import './styles/phase5-worldclass.css';
import './styles/final-butterfly-story.css';
import './styles/assistant-redesign.css';
import './styles/services-capabilities.css';
// Zuletzt: Header, Settings-Sheet und Hero wurden neu gebaut. Eigene Datei mit
// eigenen Klassennamen — die alten Regeln sind aus base.css/patches.css raus.
import './styles/shell.css';

import App from './App.jsx';

// The legacy scripts expect the CDN globals.
gsap.registerPlugin(ScrollTrigger);
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;

// No StrictMode: the legacy GSAP scripts must initialize exactly once.
createRoot(document.getElementById('root')).render(<App />);
