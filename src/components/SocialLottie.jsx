import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';

// SystemFlow — "Aus Kanälen wird ein Flow"
// Pinned 3D journey: five platform glass cards arrive from depth while the
// ambient light adapts to the active platform. GSAP drives the scroll
// choreography (outer .sf-move layer); Framer Motion only adds the small
// hover tilt on the inner card surface.

const PLATFORMS = [
  { key: 'instagram', name: 'Instagram', line: 'Reels & Reichweite', c: '#ff4ba1', glow: 'rgba(255,75,161,.34)', glow2: 'rgba(255,138,74,.20)' },
  { key: 'whatsapp',  name: 'WhatsApp',  line: 'Leads & direkte Anfragen', c: '#25d366', glow: 'rgba(37,211,102,.30)', glow2: 'rgba(37,211,102,.12)' },
  { key: 'linkedin',  name: 'LinkedIn',  line: 'B2B & Vertrauen', c: '#4f9cf0', glow: 'rgba(79,156,240,.32)', glow2: 'rgba(79,156,240,.14)' },
  { key: 'tiktok',    name: 'TikTok',    line: 'Aufmerksamkeit & Hooks', c: '#19f1e6', glow: 'rgba(25,241,230,.28)', glow2: 'rgba(255,45,120,.16)' },
  { key: 'hubspot',   name: 'HubSpot',   line: 'CRM & Automatisierung', c: '#ff7a59', glow: 'rgba(255,122,89,.32)', glow2: 'rgba(255,122,89,.14)' },
];

export default function SocialLottie() {
  const sectionRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced || !window.ScrollTrigger) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.sf-move');
      const ambient = section.querySelector('.sf-ambient');
      const dots = gsap.utils.toArray('.sf-dot');
      const head = section.querySelector('.sf-head');
      const isMobile = window.matchMedia('(max-width: 899px)').matches;

      if (isMobile) {
        // Lighter treatment on mobile: sequential rise, no deep 3D / blur.
        gsap.from(head, {
          opacity: 0, y: 28, duration: .7, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' },
        });
        cards.forEach((card) => {
          gsap.from(card, {
            opacity: 0, y: 56, scale: .94, duration: .65, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' },
          });
        });
        return;
      }

      gsap.set(head, { opacity: 0, y: 34 });
      // park every card in its depth state up front — the scrubbed fromTo
      // tweens only take over once the playhead reaches their segment
      cards.forEach((card, i) => {
        const side = i % 2 ? 1 : -1;
        gsap.set(card, { opacity: 0, z: -560, y: 90, x: side * 120, rotateY: side * 16, rotateX: 16, scale: .72, filter: 'blur(14px)', transformPerspective: 1100 });
      });

      const core = section.querySelector('.sf-core');
      gsap.set(core, { opacity: 0, scale: .55, y: 0, z: 0, transformPerspective: 1100 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.1,
        },
      });

      // Phase 1 — the sculptural core wakes up, floating and alone
      tl.to(core, { opacity: 1, scale: 1, duration: .09, ease: 'power2.out' }, 0);
      tl.to(head, { opacity: 1, y: 0, duration: .07, ease: 'power2.out' }, 0);
      // Phase 2 — the core sinks downward and back through depth for the rest
      tl.to(core, { y: () => window.innerHeight * 0.46, z: -320, scale: .5, rotateX: 14, opacity: .5, duration: .86, ease: 'power1.in' }, .12);

      const seg = .16;              // scroll window per card
      cards.forEach((card, i) => {
        const at = .14 + i * seg;   // cards begin after the core's solo moment
        const side = i % 2 ? 1 : -1;
        // arrive: depth -> front, slight axis rotation, blur -> sharp
        tl.fromTo(card,
          { opacity: 0, z: -560, y: 90, x: side * 120, rotateY: side * 16, rotateX: 16, scale: .72, filter: 'blur(14px)', transformPerspective: 1100 },
          { opacity: 1, z: 0, y: 0, x: 0, rotateY: 0, rotateX: 0, scale: 1, filter: 'blur(0px)', duration: seg * .62, ease: 'power2.out', immediateRender: false },
          at);
        // recede once the next card takes the stage (all but the last)
        if (i < cards.length - 1) {
          tl.to(card,
            { opacity: .14, z: -220, y: -64, scale: .86, filter: 'blur(7px)', duration: seg * .55, ease: 'power1.inOut' },
            at + seg * .92);
        }
        // ambient + progress state per platform
        const p = PLATFORMS[i];
        tl.to(ambient, { '--sf-glow-a': p.glow, '--sf-glow-b': p.glow2, duration: seg * .5 }, at);
        dots.forEach((dot, di) => {
          tl.to(dot, { opacity: di === i ? 1 : .28, scale: di === i ? 1 : .78, duration: .02 }, at + .02);
        });
      });
      // gentle settle at the end: last card floats up a touch
      tl.to(cards[cards.length - 1], { y: -8, duration: .08, ease: 'sine.inOut' }, '>-.02');
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <>
      <div className="sep" />
      <section className="sf-v2" id="social-lottie" ref={sectionRef} aria-label="Plattformen werden ein System">
        <div className="sf-stage">
          <div className="sf-ambient" aria-hidden="true" />
          <div className="sf-field" aria-hidden="true">
            <i /><i /><i />
          </div>
          <div className="sf-core" aria-hidden="true">
            <span className="sf-core-halo" />
            <span className="sf-core-sphere" />
            <span className="sf-core-ring sf-core-ring-1" />
            <span className="sf-core-ring sf-core-ring-2" />
            <span className="sf-core-spark" />
          </div>
          <div className="sf-head">
            <span className="section-kicker">{"// Plattformen werden verbunden"}</span>
            <h2>Aus Kanälen wird ein Flow</h2>
            <p>Jede Plattform hat eine Aufgabe. Zusammen werden sie ein System, das sichtbar macht, Vertrauen aufbaut und Anfragen bringt.</p>
          </div>
          <div className="sf-deck">
            {PLATFORMS.map((p) => (
              <div className="sf-move" key={p.key} data-platform={p.key}>
                <motion.article
                  className="sf-card"
                  style={{ '--c': p.c, '--c-glow': p.glow }}
                  whileHover={reduced ? undefined : { scale: 1.025, rotateX: -2.5, rotateY: 2.5 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                >
                  <span className="sf-card-sheen" aria-hidden="true" />
                  <div className="sf-card-icon">
                    <img src={`/icons/${p.key}.svg`} alt="" width="44" height="44" loading="lazy" />
                  </div>
                  <b>{p.name}</b>
                  <span className="sf-card-line">{p.line}</span>
                </motion.article>
              </div>
            ))}
          </div>
          <div className="sf-progress" aria-hidden="true">
            {PLATFORMS.map((p) => (
              <span className="sf-dot" key={p.key} style={{ '--c': p.c }} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
