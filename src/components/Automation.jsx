import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

// Kleiner Player auf Basis von lottie-web: pausiert offscreen,
// respektiert prefers-reduced-motion (steht dann auf einem ruhigen Frame).
function LottieVisual({ path }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animation = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: false,
      path,
    });

    const onLoaded = () => {
      if (reducedMotion) {
        animation.goToAndStop(Math.floor(animation.totalFrames / 2), true);
      }
    };
    animation.addEventListener('DOMLoaded', onLoaded);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (reducedMotion) return;
        if (entry.isIntersecting) animation.play();
        else animation.pause();
      },
      { rootMargin: '140px' },
    );
    observer.observe(container);

    return () => {
      observer.disconnect();
      animation.destroy();
    };
  }, [path]);

  return <div aria-hidden="true" className="auto-card__lottie" ref={containerRef} />;
}

export default function Automation() {
  return (
    <>
      <div className="sep" />
      <section id="automation">
        {"\n"}
        <div className="auto-cards">
          <article className="auto-card">
            <div className="auto-card__copy">
              <h3>
                {"Websysteme, die mitdenken."}
              </h3>
              <p>
                {"WordPress, WooCommerce, REST API, Webhooks und Performance werden so verbunden, dass Abläufe nicht manuell hängen bleiben."}
              </p>
            </div>
            <LottieVisual path={`${import.meta.env.BASE_URL}lottie/wordpress-design.json`} />
          </article>
          {"\n"}
          <article className="auto-card">
            <div className="auto-card__copy">
              <h3>
                {"Kampagnen sauber strukturieren."}
              </h3>
              <p>
                {"HubSpot, NapoleonCat, SocialBee, Meta und Content-Workflows werden als wiederholbare Marketing-Prozesse aufgebaut."}
              </p>
            </div>
            <LottieVisual path={`${import.meta.env.BASE_URL}lottie/targeting-ads.json`} />
          </article>
          {"\n"}
          <article className="auto-card">
            <div className="auto-card__copy">
              <h3>
                {"KI in echte Abläufe bringen."}
              </h3>
              <p>
                {"AI, Make, Zapier, n8n, CRM und Reporting werden miteinander verbunden, damit aus Ideen schneller umsetzbare Systeme entstehen."}
              </p>
            </div>
            <LottieVisual path={`${import.meta.env.BASE_URL}lottie/sparkles-ai.json`} />
          </article>
        </div>
        {"\n"}
      </section>
      </>
  );
}
