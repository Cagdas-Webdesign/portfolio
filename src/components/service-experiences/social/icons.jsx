/*
 * Kleine Interface-Zeichen fuer die Geraete-Vorschauen (Instagram, Browser,
 * LinkedIn, WhatsApp). Bewusst generisch — keine Plattform-Logos. Die
 * Glyphen des Portfolios (shared.jsx) bleiben der Erklaer-Ebene vorbehalten.
 */
const PATHS = {
  back: <path d="M15 5l-7 7 7 7" />,
  dots: <><circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /></>,
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />,
  comment: <path d="M20 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.1A8 8 0 1 1 20 11.5z" />,
  send: <path d="M21 3 10 14M21 3l-6.5 18-4.5-7-7-4.5z" />,
  save: <path d="M6 3.5h12v17l-6-4.2-6 4.2z" />,
  chevron: <path d="M9 5l7 7-7 7" />,
  lock: <><rect height="9" rx="2" width="13" x="5.5" y="10.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 8h16M4 16h16" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  like: <path d="M7 10v10H4V10zM7 10l4-7c1.7 0 2.6 1.2 2.2 2.8L12.6 9H19a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H7" />,
  repost: <path d="M17 3l3 3-3 3M4 12V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3M20 12v3a3 3 0 0 1-3 3H4" />,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5s1.2-6.1 3.8-8.5z" /></>,
  bell: <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0" />,
  check: <path d="M5 12.5l4.2 4.2L19 7" />,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>,
  users: <><circle cx="9" cy="8.5" r="3.3" /><path d="M3 19.5a6 6 0 0 1 12 0M16 5.4a3.3 3.3 0 0 1 0 6.3M18 14.2a6 6 0 0 1 3 5.3" /></>,
  phone: <><rect height="18" rx="3" width="11" x="6.5" y="3" /><path d="M10.5 17.5h3" /></>,
  play: <><rect height="16" rx="3" width="18" x="3" y="4" /><path d="M10 9v6l5-3z" /></>,
  sparkle: <path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8zM18.5 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />,
  voice: <path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2" />,
  music: <path d="M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM19 16a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />,
};

export default function PhoneIcon({ name, className = '' }) {
  return (
    <svg aria-hidden="true" className={`mk-icon ${className}`} viewBox="0 0 24 24">
      {PATHS[name]}
    </svg>
  );
}
