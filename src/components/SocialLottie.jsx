import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';

// SystemFlow v3 — "Aus Kanälen wird ein Flow"
// Cinematic pinned scene: a sculptural glass core descends through space
// while eight platform nodes assemble into a constellation above it; in the
// final act, connection lines draw from every node into the core.
// Story beats: Input → Transformation → Verbundenes System → Output.
// GSAP owns the scroll choreography; Framer Motion only the node hover.

const NODES = [
  { key: 'instagram', name: 'Instagram', icon: '/icons/instagram.svg',      c: '#ff4ba1' },
  { key: 'tiktok',    name: 'TikTok',    icon: '/icons/tiktok.svg',         c: '#19f1e6' },
  { key: 'meta',      name: 'Meta',      icon: '/icons/tech-meta.svg',      c: '#0866ff' },
  { key: 'wordpress', name: 'WordPress', icon: '/icons/tech-wordpress.svg', c: '#00ffe7' },
  { key: 'hubspot',   name: 'HubSpot',   icon: '/icons/hubspot.svg',        c: '#ff7a59' },
  { key: 'slack',     name: 'Slack',     icon: '/icons/tech-slack.svg',     c: '#36c5f0' },
  { key: 'make',      name: 'Make',      icon: '/icons/tech-make.svg',      c: '#b089ff' },
  { key: 'zapier',    name: 'Zapier',    icon: '/icons/tech-zapier.svg',    c: '#ff4a00' },
];

// Constellation slots — % of the pinned stage. The core settles at (50, 78).
const SLOTS = [
  { x: 22, y: 36 }, { x: 78, y: 36 },
  { x: 10, y: 52 }, { x: 90, y: 52 },
  { x: 27, y: 66 }, { x: 73, y: 66 },
  { x: 41, y: 44 }, { x: 59, y: 44 },
];
const CORE = { x: 50, y: 78 };

const CAPTIONS = ['Input', 'Transformation', 'Verbundenes System', 'Output: ein Flow'];

export default function SocialLottie() {
  const sectionRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced || !window.ScrollTrigger) return;

    const ctx = gsap.context(() => {
      const nodes = gsap.utils.toArray('.sf3-node');
      const lines = gsap.utils.toArray('.sf3-lines line');
      const captions = gsap.utils.toArray('.sf3-caption span');
      const ambient = section.querySelector('.sf-ambient');
      const core = section.querySelector('.sf-core');
      const head = section.querySelector('.sf-head');
      const isMobile = window.matchMedia('(max-width: 899px)').matches;

      if (isMobile) {
        // Static grid with staggered entrances — no pin, no beams, no core.
        gsap.from(head, {
          opacity: 0, y: 28, duration: .7, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' },
        });
        nodes.forEach((node, i) => {
          gsap.from(node, {
            opacity: 0, y: 40, scale: .9, duration: .55, ease: 'power3.out', delay: (i % 2) * .08,
            scrollTrigger: { trigger: node, start: 'top 92%', toggleActions: 'play none none reverse' },
          });
        });
        return;
      }

      // ---- initial states -------------------------------------------------
      gsap.set(head, { opacity: 0, y: 34 });
      gsap.set(core, { opacity: 0, scale: .55, y: 0, z: 0, transformPerspective: 1100 });
      nodes.forEach((node, i) => {
        const side = SLOTS[i].x < 50 ? -1 : 1;
        gsap.set(node, {
          opacity: 0, z: -520, y: 70, x: side * 90,
          rotateY: side * 18, scale: .55, filter: 'blur(10px)',
          transformPerspective: 1100,
        });
      });
      lines.forEach((line) => {
        const len = line.getTotalLength();
        gsap.set(line, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
      });
      gsap.set(captions, { opacity: 0, y: 10 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.1,
        },
      });

      // ---- Phase A: Input — the core wakes, floating alone ---------------
      tl.to(head, { opacity: 1, y: 0, duration: .06, ease: 'power2.out' }, 0);
      tl.to(core, { opacity: 1, scale: 1, duration: .09, ease: 'power2.out' }, .01);
      tl.to(captions[0], { opacity: 1, y: 0, duration: .04, ease: 'power2.out' }, .03);

      // ---- Phase B: Transformation — core descends, nodes assemble -------
      tl.to(captions[0], { opacity: 0, y: -10, duration: .04 }, .16);
      tl.to(captions[1], { opacity: 1, y: 0, duration: .04, ease: 'power2.out' }, .19);
      tl.to(core, {
        y: () => window.innerHeight * 0.30,
        z: -140, scale: .82, rotateX: 10,
        duration: .5, ease: 'power1.inOut',
      }, .14);

      const seg = .062;
      nodes.forEach((node, i) => {
        const at = .18 + i * seg;
        tl.to(node, {
          opacity: 1, z: 0, y: 0, x: 0, rotateY: 0, scale: 1, filter: 'blur(0px)',
          duration: .085, ease: 'back.out(1.5)',
        }, at);
        tl.to(ambient, {
          '--sf-glow-a': hexGlow(NODES[i].c, .30),
          '--sf-glow-b': hexGlow(NODES[i].c, .12),
          duration: .05,
        }, at);
      });

      // ---- Phase C: Verbundenes System — lines draw into the core --------
      tl.to(captions[1], { opacity: 0, y: -10, duration: .04 }, .70);
      tl.to(captions[2], { opacity: 1, y: 0, duration: .04, ease: 'power2.out' }, .73);
      lines.forEach((line, i) => {
        tl.to(line, { opacity: .6, duration: .02 }, .72 + i * .022);
        tl.to(line, { strokeDashoffset: 0, duration: .1, ease: 'power1.inOut' }, .72 + i * .022);
      });

      // ---- Phase D: Output — the system is live ---------------------------
      tl.to(captions[2], { opacity: 0, y: -10, duration: .04 }, .90);
      tl.to(captions[3], { opacity: 1, y: 0, duration: .04, ease: 'power2.out' }, .93);
      tl.to(core, { filter: 'brightness(1.15)', scale: .88, duration: .07, ease: 'power2.out' }, .92);
      tl.to(ambient, { '--sf-glow-a': 'rgba(0,255,231,.30)', '--sf-glow-b': 'rgba(123,97,255,.16)', duration: .06 }, .92);
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

          <div className="sf-head">
            <span className="section-kicker">{"// Plattformen werden verbunden"}</span>
            <h2>Aus Kanälen wird ein Flow</h2>
            <div className="sf3-caption" aria-hidden="true">
              {CAPTIONS.map((c) => <span key={c}>{c}</span>)}
            </div>
          </div>

          <div className="sf3-scene" aria-hidden="false">
            {/* connection lines: same %-coordinates as the node slots */}
            <svg className="sf3-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {NODES.map((n, i) => (
                <line
                  key={n.key}
                  x1={SLOTS[i].x} y1={SLOTS[i].y}
                  x2={CORE.x} y2={CORE.y}
                  stroke={n.c} strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                />
              ))}
            </svg>

            {NODES.map((n, i) => (
              <div
                className="sf3-node"
                key={n.key}
                data-platform={n.key}
                style={{ '--c': n.c, left: `${SLOTS[i].x}%`, top: `${SLOTS[i].y}%` }}
              >
                <motion.div
                  className="sf3-node-body"
                  whileHover={reduced ? undefined : { scale: 1.07, y: -3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <span className="sf3-node-icon">
                    <img src={n.icon} alt="" width="30" height="30" loading="lazy" />
                  </span>
                  <b>{n.name}</b>
                </motion.div>
              </div>
            ))}

            <div className="sf-core" aria-hidden="true">
              <span className="sf-core-halo" />
              <span className="sf-core-sphere" />
              <span className="sf-core-ring sf-core-ring-1" />
              <span className="sf-core-ring sf-core-ring-2" />
              <span className="sf-core-spark" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function hexGlow(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
