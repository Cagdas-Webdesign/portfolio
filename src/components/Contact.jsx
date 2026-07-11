import Footer from './Footer.jsx';

export default function Contact() {
  return (
    <>
      <div className="sep" />
      <section id="contact">
        {"\n"}
        <div className="contact-wrap">
          <div className="process">
            <div className="section-kicker">
              {"// Prozess"}
            </div>
            <h2>
              {"Ruhiger Abschluss. Klare Umsetzung."}
            </h2>
            <div className="steps">
              <div className="step">
                <b>
                  {"01"}
                </b>
                <div>
                  <span>
                    {"Analyse"}
                  </span>
                  <p>
                    {"Ziele, Zielgruppe, Struktur und technische Anforderungen klären."}
                  </p>
                </div>
              </div>
              <div className="step">
                <b>
                  {"02"}
                </b>
                <div>
                  <span>
                    {"Konzept & Design"}
                  </span>
                  <p>
                    {"Premium UI, Content-Struktur und Animationen sauber planen."}
                  </p>
                </div>
              </div>
              <div className="step">
                <b>
                  {"03"}
                </b>
                <div>
                  <span>
                    {"Entwicklung"}
                  </span>
                  <p>
                    {"WordPress, Code, API, Automationen und Performance zusammenführen."}
                  </p>
                </div>
              </div>
              <div className="step">
                <b>
                  {"04"}
                </b>
                <div>
                  <span>
                    {"Launch & Optimierung"}
                  </span>
                  <p>
                    {"Testing, Mobile/Safari-Check und finale Performance-Optimierung."}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {"\n"}
          <div className="contact-box">
            <div className="contact-card">
              <div className="section-kicker">
                {"// Trust & Kontakt"}
              </div>
              <h2>
                {"Projekt starten?"}
              </h2>
              <div className="trust-list">
                <div>
                  {"✓ 5+ Jahre WordPress & Elementor"}
                </div>
                <div>
                  {"✓ WooCommerce, PHP, REST API Erfahrung"}
                </div>
                <div>
                  {"✓ Social-Media-Zertifikat & Content-Systeme"}
                </div>
                <div>
                  {"✓ Performance-Fokus und klare Umsetzung"}
                </div>
              </div>
              <div className="contact-links">
                <a href="mailto:hello@cagdas-webdesign.de">
                  {"E-Mail"}
                </a>
                <a href="#">
                  {"WhatsApp"}
                </a>
                <a href="https://github.com/cagdas-webdesign" target="_blank">
                  {"GitHub"}
                </a>
                <a href="#">
                  {"CV Download"}
                </a>
              </div>
            </div>
          </div>
        </div>
        {"\n"}
        <Footer />
        {"\n"}
      </section>
      </>
  );
}
