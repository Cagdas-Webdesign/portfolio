import '../styles/footer.css';
import { useCallback, useRef, useState } from 'react';
import LegalModal from './LegalModal.jsx';

/*
 * Footer: tiefschwarz, ruhig — Marke links, Rechtliches rechts, darunter
 * eine Copyright-Zeile. Styles: styles/footer.css (Praefix .site-footer).
 *
 * Impressum/Datenschutz oeffnen je ein Fullscreen-Overlay (LegalModal.jsx).
 * Die Inhalte dort sind Platzhalter, bis die rechtlichen Texte vorliegen.
 */
export default function Footer() {
  const year = new Date().getFullYear();
  const [legalPage, setLegalPage] = useState(null);
  const triggerRef = useRef(null);

  const openLegal = (page) => (event) => {
    triggerRef.current = event.currentTarget;
    setLegalPage(page);
  };
  const closeLegal = useCallback(() => setLegalPage(null), []);

  return (
    <footer className="site-footer" data-keep-text="">
      <div className="site-footer__inner">
        <div className="site-footer__main">
          <div className="site-footer__brand">
            <span className="site-footer__name">Çağdaş Uçar</span>
            <p className="site-footer__claim">Fullstack Web Developer</p>
          </div>

          {/* Bewusst kein <nav>: shell.css stylt den Header ueber den
              Element-Selektor nav (position: fixed). role ist gleichwertig. */}
          <div aria-label="Rechtliches" className="site-footer__legal" role="navigation">
            <button
              aria-haspopup="dialog"
              className="site-footer__link"
              onClick={openLegal('impressum')}
              type="button"
            >
              Impressum
            </button>
            <button
              aria-haspopup="dialog"
              className="site-footer__link"
              onClick={openLegal('datenschutz')}
              type="button"
            >
              Datenschutz
            </button>
          </div>
        </div>

        <p className="site-footer__copy">© {year} Çağdaş Uçar · Bottrop</p>
      </div>

      <LegalModal onClose={closeLegal} page={legalPage} returnFocusRef={triggerRef} />
    </footer>
  );
}
