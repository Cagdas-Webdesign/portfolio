import '../styles/social-reveal.css';
import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PLATFORMS = [
  { key: 'instagram', icon: `${import.meta.env.BASE_URL}icons/instagram.svg`, color: '#f35da8' },
  { key: 'linkedin', icon: `${import.meta.env.BASE_URL}icons/linkedin.svg`, color: '#5ca9e8' },
  { key: 'tiktok', icon: `${import.meta.env.BASE_URL}icons/tiktok.svg`, color: '#65ddd8' },
  { key: 'whatsapp', icon: `${import.meta.env.BASE_URL}icons/whatsapp.svg`, color: '#67c68a' },
  { key: 'meta', icon: `${import.meta.env.BASE_URL}icons/tech-meta.svg`, color: '#6c91ee' },
  { key: 'hubspot', icon: `${import.meta.env.BASE_URL}icons/hubspot.svg`, color: '#e88965' },
];

// Neutrale Story-Leiste: Themen statt Personen, Farbflaechen statt Gesichter
const STORIES = [
  { label: 'Deine Story', tone: 'mine' },
  { label: 'content', tone: 'a' },
  { label: 'strategie', tone: 'b' },
  { label: 'kampagnen', tone: 'c' },
  { label: 'reels', tone: 'd' },
  { label: 'analytics', tone: 'e' },
];

const HANDLE = 'cu.portfolio';

/* Oeffnet das bestehende Popup 6 (Social Media) in NestedOffers. */
function openSocialExperience(event) {
  window.dispatchEvent(new CustomEvent('services:open', { detail: { id: 'social', trigger: event.currentTarget, source: 'social-media-more' } }));
}

/* ==================================================================
 * Zertifizierter Social Media Manager — Instagram-Post-Reveal.
 *
 * Die Section sieht zuerst aus wie immer (Headline, Subline, Icons auf
 * Schwarz). Genau dieser Inhalt ist das Bild eines Posts: Beim Scrollen
 * zoomt die Welt heraus, die helle Feed-Oberflaeche blendet ein, danach
 * der kupferfarbene Pro-Max-Rahmen. Erst wenn das Geraet steht,
 * erscheint „Mehr erfahren“ (oeffnet Popup 6).
 *
 * Geometrie: Einheit --p = Postbreite / 400. Der Post ist bei Scale 1
 * exakt so breit wie die Stage, sein Mittelpunkt ist der Ursprung der
 * Welt. Groessen/Offsets misst JS aus dem Layout (transformfrei).
 * ================================================================== */
export default function Certificate() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touchScrub = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const stage = section.querySelector('.cert-network__stage');
    const world = section.querySelector('.smr-world');
    const phone = section.querySelector('.smr-phone');
    const media = section.querySelector('.smr-post__media');

    const screen = section.querySelector('.smr-screen');

    /*
     * Zwei Render-Modi derselben Geometrie (alles in Einheiten von --p):
     *   Zoom   — Layout in Stagegroesse (--k = 1), verkleinert per transform
     *   Nativ  — Layout direkt in Endgroesse (--k = Endscale), scale 1
     * Im Endzustand gilt „nativ“: Text, Icons und Linien werden in ihrer
     * echten Pixelgroesse gerendert statt als verkleinerte Grossvariante.
     */
    const unit = () => media.offsetWidth / 400; // aktuelles --p in px
    const baseUnit = () => stage.clientWidth / 400; // --p bei --k = 1

    // Post-Mittelpunkt relativ zum Geraet, in --p-Einheiten
    const mediaCenter = () => {
      const p = unit();
      return {
        x: (screen.offsetLeft + media.offsetLeft + media.offsetWidth / 2) / p,
        y: (screen.offsetTop + media.offsetTop + media.offsetHeight / 2) / p,
      };
    };

    /*
     * Zeilenumbruch einfrieren: Im nativen Endzustand weichen Glyphenbreiten
     * minimal ab (Hinting) — die Headline koennte anders umbrechen. Deshalb
     * im Referenzlayout (--k = 1) die breiteste Zeile messen und als
     * mitskalierende max-width setzen.
     */
    const wrapTargets = ['#cert-network-title span', '#cert-network-title strong', '.cert-network__subline']
      .map((selector) => section.querySelector(selector))
      .filter(Boolean);
    const lockWrap = () => {
      const previousK = world.style.getPropertyValue('--k');
      world.style.setProperty('--k', 1);
      wrapTargets.forEach((el) => { el.style.maxWidth = ''; });
      const toLayout = media.offsetWidth / media.getBoundingClientRect().width; // Transform herausrechnen
      wrapTargets.forEach((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        const lines = new Map();
        [...range.getClientRects()].forEach((rect) => {
          const key = Math.round(rect.top / 4);
          const line = lines.get(key) || { left: Infinity, right: -Infinity };
          line.left = Math.min(line.left, rect.left);
          line.right = Math.max(line.right, rect.right);
          lines.set(key, line);
        });
        const widest = Math.max(0, ...[...lines.values()].map((line) => line.right - line.left)) * toLayout;
        if (widest > 0) el.style.maxWidth = `calc(var(--px) * ${Math.ceil(widest) + 2})`;
        el.style.marginInline = 'auto';
      });
      world.style.setProperty('--k', previousK || 1);
    };

    // Geraet so legen, dass der Post-Mittelpunkt im Weltursprung (Stage-Mitte) liegt.
    const place = () => {
      lockWrap();
      const c = mediaCenter();
      phone.style.left = `calc(var(--p) * ${-c.x})`;
      phone.style.top = `calc(var(--p) * ${-c.y})`;
      world.style.setProperty('--sh', `${stage.clientHeight / 100}px`);
    };

    // Endzustand: ganzes Geraet im Viewport, Platz fuer Nav oben und CTA unten.
    const finalState = () => {
      const vw = stage.clientWidth;
      const vh = stage.clientHeight;
      const mobile = vw < 700;
      const top = mobile ? 88 : 84;
      const bottom = mobile ? 104 : 112;
      const ratio = baseUnit() / unit();
      const phoneW = phone.offsetWidth * ratio;
      const phoneH = phone.offsetHeight * ratio;
      const scale = Math.min((vh - top - bottom) / phoneH, (vw * (mobile ? 0.86 : 0.6)) / phoneW);
      const offset = phoneH / 2 - mediaCenter().y * baseUnit();
      return { scale, y: -offset * scale + (top - bottom) / 2 };
    };

    // t = 0 … 1 (logarithmisch); bei t = 1 nativer Endzustand
    const render = (end, t) => {
      if (t >= 1) {
        world.style.setProperty('--k', end.scale);
        gsap.set(world, { scale: 1, y: Math.round(end.y), force3D: false });
        return;
      }
      world.style.setProperty('--k', 1);
      const scale = end.scale ** t;
      gsap.set(world, { scale, y: Math.round(end.y * (scale - 1) / (end.scale - 1)), force3D: false });
    };

    place();

    if (reducedMotion) {
      section.classList.add('smr--static', 'is-revealed');
      const apply = () => {
        world.style.setProperty('--k', 1);
        place();
        render(finalState(), 1);
      };
      apply();
      window.addEventListener('resize', apply);
      return () => window.removeEventListener('resize', apply);
    }

    // Word-Reveal-Vorbereitung: Subline in Wort-Spans aufteilen, Text bleibt
    // über aria-label vollständig zugänglich.
    const subline = section.querySelector('.cert-network__subline');
    const sublineText = subline ? subline.textContent.trim() : '';
    let sublineWords = [];
    if (subline && sublineText) {
      subline.setAttribute('aria-label', sublineText);
      subline.innerHTML = sublineText
        .split(/\s+/)
        .map((word) => `<span class="cert-word" aria-hidden="true">${word}</span>`)
        .join(' ');
      sublineWords = Array.from(subline.querySelectorAll('.cert-word'));
    }

    const hoverCleanups = [];

    ScrollTrigger.addEventListener('refreshInit', place);
    let onRefresh = null;

    const context = gsap.context(() => {
      const chrome = gsap.utils.toArray('.smr-chrome', section);
      const postChrome = gsap.utils.toArray('.smr-post__head, .smr-post__foot', section);
      const frame = section.querySelector('.smr-phone__frame');

      /*
       * Zoom logarithmisch interpoliert: gleiche Scrollstrecke = gleiche
       * wahrgenommene Zoomstufe (linear in scale waere am Ende hektisch).
       * Der Fokus wandert dabei vom Post- zum Geraetemittelpunkt.
       */
      let end = finalState();
      const zoom = { t: 0 };
      const applyZoom = () => render(end, zoom.t);
      onRefresh = () => { end = finalState(); applyZoom(); };
      ScrollTrigger.addEventListener('refresh', onRefresh);
      render(end, 0);
      gsap.set(screen, { '--smr-screen': 0 });
      gsap.set([...chrome, ...postChrome], { opacity: 0 });
      gsap.set(frame, { opacity: 0 });

      /*
       * Phasen (Anteil des Scrollwegs):
       * A 0–0.10  normale Section · B 0.10–0.86 Zoom-Out
       * C 0.20–0.46 helle Oberflaeche · D 0.34–0.56 Post-Kontext
       * E 0.52–0.72 Geraeterahmen · F/G ab 0.86 Stillstand · H CTA
       */
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'certificate-post-reveal',
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          // Touch: mehr Nachlauf, damit der Zoom dem Finger weich folgt.
          // Maus/Trackpad (Desktop) unveraendert 0.8.
          scrub: touchScrub ? 1.6 : 0.8,
          invalidateOnRefresh: true,
          onUpdate(self) {
            section.classList.toggle('is-revealed', self.progress > 0.9);
          },
        },
      });

      timeline
        .to(zoom, { t: 1, duration: 0.76, ease: 'sine.inOut', onUpdate: applyZoom }, 0.1)
        .to(screen, { '--smr-screen': 1, duration: 0.26, ease: 'power1.inOut' }, 0.2)
        .to(chrome, { opacity: 1, duration: 0.2, stagger: 0.02, ease: 'power1.out' }, 0.26)
        .to(postChrome, { opacity: 1, duration: 0.16, stagger: 0.04, ease: 'power1.out' }, 0.34)
        .to(frame, { opacity: 1, duration: 0.2, ease: 'power1.inOut' }, 0.52)
        .to({}, { duration: 0.14 }, 0.86);

      // Einmaliger Entrance-Reveal beim ersten Eintritt der Section:
      // Überschrift (maskiert) → Subline (Wörter) → Icon-Reihe (Stagger).
      const titleLines = gsap.utils.toArray('#cert-network-title > span, #cert-network-title > strong', section);
      const iconRowItems = gsap.utils.toArray('.cert-network__iconrow li', section);

      const entrance = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 72%',
          toggleActions: 'play none none reverse',
          // Pin-Layouts oberhalb verschieben die Startmarke bei Refreshes;
          // steht der Nutzer bereits in der Section, Inhalt sicher zeigen.
          onRefresh(self) {
            if (self.progress > 0 && !self.animation.isActive()) self.animation.progress(1);
          },
        },
      });

      if (titleLines.length) {
        entrance.fromTo(titleLines, { yPercent: 112 }, { yPercent: 0, duration: 0.95, stagger: 0.12, ease: 'power4.out' }, 0);
      }

      if (sublineWords.length) {
        entrance.fromTo(sublineWords, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.018, ease: 'power2.out' }, 0.38);
      }

      if (iconRowItems.length) {
        entrance.fromTo(
          iconRowItems,
          { opacity: 0, y: 18, scale: 0.88 },
          { opacity: 1, y: 0, scale: 1, duration: 0.65, stagger: 0.08, ease: 'power3.out' },
          0.55,
        );
      }

      // Magnetischer Hover: nur bei präzisem Pointer, ohne React-State,
      // über performante quickTo-Tweens.
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        iconRowItems.forEach((el) => {
          const toX = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' });
          const toY = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });
          const toScale = gsap.quickTo(el, 'scale', { duration: 0.45, ease: 'power3.out' });

          const onMove = (event) => {
            // Im Post/Geraet keine Mikrobewegungen einzelner Icons
            if (zoom.t > 0.01) return;
            const rect = el.getBoundingClientRect();
            const relX = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
            const relY = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
            toX(Math.max(-1, Math.min(1, relX)) * 5);
            toY(Math.max(-1, Math.min(1, relY)) * 5);
            toScale(1.04);
          };
          const onLeave = () => {
            toX(0);
            toY(0);
            toScale(1);
          };

          el.addEventListener('mousemove', onMove);
          el.addEventListener('mouseleave', onLeave);
          hoverCleanups.push(() => {
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseleave', onLeave);
          });
        });
      }
    }, section);

    return () => {
      hoverCleanups.forEach((fn) => fn());
      ScrollTrigger.removeEventListener('refreshInit', place);
      if (onRefresh) ScrollTrigger.removeEventListener('refresh', onRefresh);
      context.revert();
      section.classList.remove('is-revealed');
      if (subline && sublineText) {
        subline.textContent = sublineText;
        subline.removeAttribute('aria-label');
      }
    };
  }, []);

  return (
    <>
      <div className="sep" />
      <section
        aria-labelledby="cert-network-title"
        className="cert-network smr"
        id="certified-social-media-manager"
        ref={sectionRef}
      >
        <div className="cert-network__stage">
          {/* Aeusserer Wrapper; die Welt darin traegt Zoom und Geraet.
              Nach dem Reveal steht alles still (kein Float). */}
          <div className="smr-float">
          <div className="smr-world">
            <div className="smr-phone">
              <div aria-hidden="true" className="smr-phone__frame">
                <span className="smr-phone__key is-action" />
                <span className="smr-phone__key is-vol-up" />
                <span className="smr-phone__key is-vol-down" />
                <span className="smr-phone__key is-power" />
                <span className="smr-phone__key is-control" />
              </div>

              <div className="smr-screen">
                <span aria-hidden="true" className="smr-island smr-chrome" />

                {/* Statusleiste + App-Kopf */}
                <div aria-hidden="true" className="smr-status smr-chrome">
                  <span>9:41</span>
                  <span className="smr-status__icons">
                    <svg className="is-signal" viewBox="0 0 18 12"><rect height="3.6" rx="1.1" width="3.2" x="0" y="8.4" /><rect height="5.8" rx="1.1" width="3.2" x="4.9" y="6.2" /><rect height="8.4" rx="1.1" width="3.2" x="9.8" y="3.6" /><rect height="12" rx="1.1" width="3.2" x="14.7" y="0" /></svg>
                    <svg className="is-wifi" viewBox="0 0 17 12"><path d="M1.3 4.2a10.4 10.4 0 0 1 14.4 0M4 7a6.6 6.6 0 0 1 9 0" /><circle cx="8.5" cy="10.2" fill="currentColor" r="1.5" stroke="none" /></svg>
                    <span className="smr-battery"><b>82</b><i /></span>
                  </span>
                </div>

                <div aria-hidden="true" className="smr-appbar smr-chrome">
                  <svg className="smr-ico" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                  <b className="smr-appbar__brand">Feed</b>
                  <span className="smr-appbar__actions">
                    <svg className="smr-ico" viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" /></svg>
                    <svg className="smr-ico" viewBox="0 0 24 24"><path d="M20.5 3.5 3.5 10l6.6 2.4M20.5 3.5 14 20.5l-3.9-8.1M20.5 3.5l-10.4 8.9" /></svg>
                  </span>
                </div>

                <ul aria-hidden="true" className="smr-stories smr-chrome">
                  {STORIES.map((story) => (
                    <li className={`is-${story.tone}`} key={story.label}>
                      <i><span>{story.tone === 'mine' ? 'ÇU' : story.label.slice(0, 1).toUpperCase()}</span></i>
                      <em>{story.label}</em>
                    </li>
                  ))}
                </ul>

                {/* Der Post — sein Bild ist die bisherige Section */}
                <article className="smr-post">
                  <header aria-hidden="true" className="smr-post__head">
                    <span className="smr-avatar is-ring"><span>ÇU</span></span>
                    <span className="smr-post__who">
                      <b>{HANDLE}</b>
                      <small>Social Media Management</small>
                    </span>
                    <svg className="smr-ico is-more" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></svg>
                  </header>

                  <div className="smr-post__media">
                    <header className="cert-network__intro">
                      <h2 id="cert-network-title">
                        <span>Zertifizierter</span>
                        <strong>Social Media Manager</strong>
                      </h2>
                      <p className="cert-network__subline">
                        Strategie, Content und Plattformen als verbundenes System.
                      </p>
                      <ul aria-hidden="true" className="cert-network__iconrow">
                        {PLATFORMS.map((platform) => (
                          <li key={platform.key} style={{ '--cert-accent': platform.color }}>
                            <img alt="" height="22" loading="lazy" src={platform.icon} width="22" />
                          </li>
                        ))}
                      </ul>
                    </header>
                  </div>

                  <footer aria-hidden="true" className="smr-post__foot">
                    <div className="smr-post__actions">
                      <svg className="smr-ico" viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" /></svg>
                      <svg className="smr-ico" viewBox="0 0 24 24"><path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.5-4.4a8.4 8.4 0 1 1 15.5-4.5z" /></svg>
                      <svg className="smr-ico" viewBox="0 0 24 24"><path d="M20.5 3.5 3.5 10l6.6 2.4M20.5 3.5 14 20.5l-3.9-8.1M20.5 3.5l-10.4 8.9" /></svg>
                      <svg className="smr-ico is-save" viewBox="0 0 24 24"><path d="M6 3.5h12v17l-6-4.4-6 4.4z" /></svg>
                    </div>
                    <p className="smr-post__likes">Gefällt vielen Personen</p>
                    <p className="smr-post__caption">
                      <b>{HANDLE}</b> Strategie, Content und Plattformen als verbundenes System. <span>#socialmedia #content #strategie</span>
                    </p>
                  </footer>
                </article>

                <div aria-hidden="true" className="smr-tabbar smr-chrome">
                  <svg className="smr-ico" viewBox="0 0 24 24"><path d="M4 10.5 12 4l8 6.5V20h-5v-5.5H9V20H4z" /></svg>
                  <svg className="smr-ico" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
                  <svg className="smr-ico" viewBox="0 0 24 24"><rect height="16" rx="4.5" width="16" x="4" y="4" /><path d="M12 8.5v7M8.5 12h7" /></svg>
                  <svg className="smr-ico" viewBox="0 0 24 24"><rect height="16" rx="4.5" width="16" x="4" y="4" /><path d="M10.5 9.5v5l4-2.5z" /></svg>
                  <span className="smr-avatar is-small">ÇU</span>
                </div>
                <span aria-hidden="true" className="smr-home smr-chrome" />
              </div>
            </div>
          </div>

          </div>

          <div className="smr-cta">
            <button className="smr-cta__button" onClick={openSocialExperience} type="button">
              Mehr erfahren
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h13M12.5 6l5.5 6-5.5 6" /></svg>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
