import { useCallback, useEffect, useRef, useState } from 'react';
import SettingsSheet from './SettingsSheet.jsx';

export default function Nav() {
  const [lifted, setLifted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);

  /*
   * Ueber dem Hero traegt der Header keine Flaeche. Erst wenn Inhalt darunter
   * durchlaeuft, legt sich die Blur-Schicht darunter. Ein Schwellwert mit
   * Hysterese, damit der Zustand am Rand nicht flackert.
   */
  useEffect(() => {
    let frame = 0;

    const read = () => {
      frame = 0;
      const y = window.scrollY || 0;
      setLifted((current) => (current ? y > 12 : y > 42));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const goHome = useCallback((event) => {
    event.preventDefault();
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    // Der Hero hoert darauf und spielt seine Eintritts-Timeline erneut.
    window.dispatchEvent(new CustomEvent('hero:replay'));
  }, []);

  return (
    <>
      <nav aria-label="Hauptnavigation" className={lifted ? 'is-lifted' : undefined}>
        <a
          aria-label="ÇU — zum Seitenanfang"
          className="shell-logo"
          href="#hero"
          onClick={goHome}
        >
          ÇU
        </a>

        <button
          aria-controls="shell-sheet"
          aria-expanded={menuOpen}
          aria-haspopup="dialog"
          className="shell-menu"
          onClick={openMenu}
          ref={menuButtonRef}
          type="button"
        >
          <span>Menü</span>
          <svg
            aria-hidden="true"
            className="shell-menu__glyph"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.7"
            viewBox="0 0 20 20"
          >
            <path d="M3 6.5h6.2M13.1 6.5H17" />
            <circle cx="11.2" cy="6.5" r="1.9" />
            <path d="M3 13.5h2.9M9.8 13.5H17" />
            <circle cx="7.9" cy="13.5" r="1.9" />
          </svg>
        </button>
      </nav>

      <SettingsSheet
        onClose={closeMenu}
        open={menuOpen}
        returnFocusRef={menuButtonRef}
      />
    </>
  );
}
