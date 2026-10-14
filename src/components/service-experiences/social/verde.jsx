import { useId } from 'react';
import { VERDE_ASSETS } from './campaignData.js';

/* ==================================================================
 * VERDE — Garten & Landschaft
 *
 * Fiktive Beispielmarke, die durch das ganze Pop-up traegt. Alles, was
 * zur Marke gehoert, liegt hier an einer Stelle: Farben, Wortmarke und
 * Bildwelt. Brief, Brand System, Anzeige, Landingpage und
 * Plattform-Varianten greifen darauf zu — Konsistenz entsteht dadurch
 * technisch und nicht nur behauptet.
 *
 * Echte Bilder einsetzen: in VERDE_ASSETS (campaignData.js) eine URL eintragen (z. B. aus
 * /public/assets/...). GardenVisual rendert dann ein <img> mit
 * object-fit: cover statt der gezeichneten Szene. Ausschnitt und
 * Einbindung bleiben identisch.
 * ================================================================== */

/* Zeichen: ein Bogen wie ein Gartentor, darin ein Blattstiel. */
export function VerdeMark({ className = '' }) {
  return (
    <svg aria-hidden="true" className={`mk-verde-mark ${className}`} viewBox="0 0 32 32">
      <path d="M7 28V15a9 9 0 0 1 18 0v13" />
      <path d="M16 28V17.5c0-3.4 2.2-5.6 5.4-6.1-.2 3.3-2.3 5.6-5.4 6.1" />
    </svg>
  );
}

export function VerdeWordmark({ className = '', sub = true }) {
  return (
    <span className={`mk-verde-wordmark ${className}`}>
      <b>VERDE</b>
      {sub ? <small>Garten &amp; Landschaft</small> : null}
    </span>
  );
}

/*
 * Gezeichnete Gartenszene (Platzhalter fuer ein echtes Foto).
 *
 * Die viewBox entspricht einem Handy-Bildschirm. Mit `slice` fuellt die
 * Szene jede Flaeche: in der Anzeige ist nur der mittlere Ausschnitt zu
 * sehen, auf der Landingpage die ganze Szene. Genau darauf beruht der
 * Uebergang — das Bild der Anzeige "oeffnet" sich zur Landingpage.
 *
 * Jede Flaeche ist breiter als die Szene, beschnitten wird also immer
 * oben/unten. `focusY` legt fest, welche Hoehe der Szene im Ausschnitt
 * mittig liegt (Standard 422 = Mitte). Querformate zeigen mit ~480
 * Verglasung, Deck und Licht statt Himmel und Kronen.
 */
function GardenScene({ variant = 'after', focusY = 422 }) {
  const uid = useId().replace(/:/g, '');
  const id = (name) => `${uid}-${name}`;
  const before = variant === 'before';

  return (
    <svg
      aria-hidden="true"
      className="mk-garden-scene"
      preserveAspectRatio="xMidYMid slice"
      viewBox={`0 ${focusY - 422} 390 844`}
    >
      <defs>
        <linearGradient id={id('sky')} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={before ? '#1a2320' : '#07130f'} />
          <stop offset="0.3" stopColor={before ? '#2a3431' : '#10251c'} />
          <stop offset="0.41" stopColor={before ? '#4a524a' : '#5b5c40'} />
          <stop offset="0.46" stopColor={before ? '#39413a' : '#243427'} />
        </linearGradient>
        <radialGradient cx="0.3" cy="0.4" id={id('glow')} r="0.42">
          <stop offset="0" stopColor="#e2b273" stopOpacity={before ? 0.08 : 0.55} />
          <stop offset="1" stopColor="#e2b273" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('window')} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f7d9a4" />
          <stop offset="0.55" stopColor="#e5a862" />
          <stop offset="1" stopColor="#b8783f" />
        </linearGradient>
        <linearGradient id={id('deck')} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7a5a3e" />
          <stop offset="1" stopColor="#3d2b1e" />
        </linearGradient>
        <linearGradient id={id('pool')} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#24524d" />
          <stop offset="1" stopColor="#0c2424" />
        </linearGradient>
        <linearGradient id={id('lawn')} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={before ? '#3d4a32' : '#172b1f'} />
          <stop offset="1" stopColor={before ? '#1d2419' : '#08120d'} />
        </linearGradient>
        <radialGradient id={id('lamp')} r="0.5">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Himmel, Abendlicht, Baumkulisse */}
      <rect fill={`url(#${id('sky')})`} height="844" width="390" />
      <rect fill={`url(#${id('glow')})`} height="844" width="390" />
      <path
        d="M0 352c18-30 40-34 58-22 12-26 42-30 58-8 18-20 44-16 56 6 22-16 50-10 60 12 18-10 40-6 52 10 20-14 44-12 60 4 16-8 34-6 46 6V420H0z"
        fill={before ? '#262f2a' : '#0b1913'}
      />

      {/* Haus: Kubus, auskragendes Dach, grosse Verglasung */}
      <rect fill={before ? '#2c3430' : '#16231d'} height="84" width="160" x="250" y="188" />
      <rect fill={before ? '#3a423d' : '#2a3a33'} height="10" width="176" x="238" y="180" />
      <rect
        fill={before ? '#3b433e' : `url(#${id('window')})`}
        height="38"
        opacity={before ? 0.9 : 0.85}
        width="112"
        x="276"
        y="212"
      />
      <rect fill={before ? '#262e2a' : '#121e19'} height="252" width="260" x="150" y="268" />
      <rect fill={before ? '#3f4742' : '#2b3c34'} height="14" width="296" x="118" y="258" />
      <rect fill={before ? '#303834' : '#1b2a23'} height="248" width="26" x="150" y="272" />
      <rect fill={before ? '#343c37' : `url(#${id('window')})`} height="206" width="206" x="182" y="298" />
      {!before && (
        <>
          <circle cx="262" cy="338" fill="#fff3d6" opacity="0.8" r="4" />
          <circle cx="262" cy="338" fill={`url(#${id('lamp')})`} r="46" />
          <rect fill="#8a5a31" height="30" opacity="0.55" width="96" x="214" y="464" />
        </>
      )}
      <path d="M233 298v206M285 298v206M337 298v206" stroke={before ? '#262e2a' : '#121e19'} strokeWidth="4" />

      {before ? (
        <>
          {/* Vorher: Rasen, Zaun, eine nackte Platte, ungeordnetes Gruen */}
          <rect fill={`url(#${id('lawn')})`} height="330" width="390" y="514" />
          <rect fill="#6d6c64" height="30" opacity="0.7" width="170" x="200" y="514" />
          <path d="M0 470h150M0 492h150" stroke="#55594f" strokeWidth="2" />
          {[8, 36, 64, 92, 120, 148].map((x) => (
            <path d={`M${x} 462v70`} key={x} stroke="#55594f" strokeWidth="3" />
          ))}
          <path
            d="M-10 560c30-40 70-44 96-14 22-26 60-20 70 12 12 40-40 60-86 52-44-8-90-10-80-50z"
            fill="#2f3a2a"
          />
          <path d="M250 700c40-30 110-26 150 6v140H230z" fill="#2a3324" />
        </>
      ) : (
        <>
          {/* Nachher: Holzdeck, Lichtfall, Wasserbecken, Wege, Pflanzung */}
          <path d="M40 518h350v72H0z" fill={`url(#${id('deck')})`} />
          <path d="M34 532h356M24 547h366M13 562h377M4 577h386" stroke="#2a1d14" strokeOpacity="0.45" />
          <path d="M182 518h206l2 72H150z" fill="#f2bb74" opacity="0.2" />
          <rect fill={`url(#${id('lawn')})`} height="254" width="390" y="590" />
          <path d="M0 600h250l-20 52H0z" fill={`url(#${id('pool')})`} />
          <path d="M0 600h250" stroke="#d6ccb6" strokeOpacity="0.7" strokeWidth="3" />
          <rect fill="#f2c285" height="4" opacity="0.5" rx="2" width="96" x="104" y="612" />
          <rect fill="#f2c285" height="3" opacity="0.28" rx="1.5" width="70" x="118" y="626" />
          <path
            d="M270 668h72l6 13h-86zM284 704h80l8 16h-96zM298 748h90l6 20H288z"
            fill="#c9bfab"
            opacity="0.42"
          />
          {/* Mehrstaemmiger Baum links */}
          <path d="M66 590c-4-70-10-130-4-200M74 590c6-60 14-110 30-170M58 590c-10-50-22-90-30-130" stroke="#2c231b" strokeWidth="4" />
          <g fill="#1c3325">
            <circle cx="60" cy="378" r="54" />
            <circle cx="104" cy="404" r="40" />
            <circle cx="22" cy="430" r="40" />
            <circle cx="86" cy="340" r="38" />
          </g>
          <g fill="#2f5139" opacity="0.8">
            <circle cx="74" cy="360" r="22" />
            <circle cx="112" cy="392" r="16" />
            <circle cx="34" cy="414" r="18" />
          </g>
          {/* Buchskugeln und Graeser */}
          <circle cx="30" cy="592" fill="#1f3a29" r="22" />
          <circle cx="24" cy="584" fill="#2f5139" r="9" />
          <circle cx="366" cy="604" fill="#1f3a29" r="18" />
          <circle cx="360" cy="597" fill="#2f5139" r="7" />
          <g fill="none" stroke="#95ab88" strokeLinecap="round" strokeOpacity="0.62" strokeWidth="1.6">
            <path d="M18 844c-2-60 4-100 20-130M30 844c4-50 14-80 40-100M8 844c-8-40-14-70-30-90M44 844c10-40 26-66 54-78M54 844c0-34 6-54 20-70" />
            <path d="M330 600c0-20 4-34 12-44M340 600c6-18 12-30 24-38M350 600c2-14 8-24 18-30M320 600c-4-14-10-24-18-30" />
            <path d="M330 844c2-50 10-86 30-110M346 844c8-40 20-66 44-84M318 844c-6-40-16-66-34-86" />
          </g>
          {/* Gartenlichter */}
          {[[140, 604], [262, 664], [20, 700], [372, 730]].map(([cx, cy]) => (
            <g key={`${cx}-${cy}`}>
              <circle cx={cx} cy={cy} fill={`url(#${id('lamp')})`} r="18" />
              <circle cx={cx} cy={cy} fill="#ffe2b0" r="2.4" />
            </g>
          ))}
        </>
      )}
    </svg>
  );
}

/*
 * Bildflaeche der Marke. Mit Asset: echtes Foto. Ohne: gezeichnete Szene.
 */
export function GardenVisual({ variant = 'after', focusY, className = '', label }) {
  const src = variant === 'before' ? VERDE_ASSETS.before : VERDE_ASSETS.garden;
  return (
    <div
      aria-label={label}
      className={`mk-garden ${className}`}
      data-variant={variant}
      role={label ? 'img' : undefined}
    >
      {src ? (
        <img
          alt=""
          decoding="async"
          src={src}
          style={focusY ? { objectPosition: `50% ${Math.round((focusY / 844) * 100)}%` } : undefined}
        />
      ) : (
        <GardenScene focusY={focusY} variant={variant} />
      )}
    </div>
  );
}
