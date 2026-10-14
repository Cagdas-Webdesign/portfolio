import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { EASE, ModuleHeading } from '../shared.jsx';
import PhoneIcon from './icons.jsx';
import { VerdeMark } from './verde.jsx';

/* ==================================================================
 * 01 — Campaign Brief
 *
 * Links das Briefing wie ein echtes Arbeitsdokument, rechts die Kette,
 * die daraus folgt: Objective → Audience → Message → Format. Der einzige
 * Schalter ist das Ziel. Er zeigt, worum es in diesem Kapitel geht: Wer
 * das Ziel aendert, aendert alles danach. Die Kampagne selbst arbeitet
 * mit "Leads"; "Reichweite" ist die Gegenprobe.
 * ================================================================== */

const OBJECTIVES = [
  { id: 'leads', label: 'Leads' },
  { id: 'reach', label: 'Reichweite' },
];

// Liest sich als ein Satz: „Wir wollen … von … über … mit … für … in …“
const CONNECTORS = ['Wir wollen', 'von', 'über', 'mit', 'für', 'in'];

const BRIEF = {
  leads: {
    fields: [
      ['Ziel', 'Qualifizierte Anfragen', 'Gemessen an Anfragen, nicht an Likes', 'target'],
      ['Zielgruppe', 'Hausbesitzer mit konkretem Gartenprojekt', 'Regional, in der Planungsphase', 'users'],
      ['Kanal', 'Instagram Paid Social', 'Feed & Reels, regional ausgespielt', 'phone'],
      ['Format', 'Visual Ad · Short Form', 'Ein Motiv, ein Satz, ein Button', 'play'],
      ['Angebot', 'Unverbindliche Erstberatung', 'Niedrige Schwelle für den ersten Schritt', 'sparkle'],
      ['Brand Voice', 'Klar · hochwertig · persönlich', 'Ruhig statt laut', 'voice'],
    ],
    chain: [
      ['Objective', 'Anfragen gewinnen', 'Gemessen wird, wer anfragt — nicht, wer liked.'],
      ['Audience', 'Hausbesitzer mit Plan', 'Menschen, die ihren Außenbereich neu denken wollen.'],
      ['Message', 'Ein Ansprechpartner für alles', 'Planung, Bau und Pflege aus einer Hand.'],
      ['Format', 'Paid Social · Short Form', 'Ein Motiv, ein Satz, ein Button.'],
    ],
  },
  reach: {
    fields: [
      ['Ziel', 'Reichweite', 'Marke bekannt machen', 'target'],
      ['Zielgruppe', 'Wohninteressierte in der Region', 'Noch ohne konkretes Projekt', 'users'],
      ['Kanal', 'Instagram Reels', 'Organisch und beworben', 'phone'],
      ['Format', 'Reel · mehrere Szenen', 'Atmosphäre, Handwerk, Einblicke', 'play'],
      ['Angebot', 'Kein Angebot', 'Inspiration statt Anfrage', 'sparkle'],
      ['Brand Voice', 'Klar · hochwertig · persönlich', 'Ruhig statt laut', 'voice'],
    ],
    chain: [
      ['Objective', 'Erinnert werden', 'Gemessen wird, wer zusieht und wiederkommt.'],
      ['Audience', 'Breit & regional', 'Viele Menschen, noch ohne konkreten Anlass.'],
      ['Message', 'So kann ein Garten wirken', 'Stimmung und Qualität zeigen, nichts verkaufen.'],
      ['Format', 'Reel · organisch', 'Mehrere Szenen, ruhiger Schnitt.'],
    ],
  },
};

export default function CampaignBrief({ reducedMotion }) {
  const [objective, setObjective] = useState('leads');
  const brief = BRIEF[objective];
  const swap = {
    initial: { opacity: 0, y: reducedMotion ? 0 : 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reducedMotion ? 0 : -6 },
  };

  return (
    <section className="sc-experience__section mk-brief">
      <ModuleHeading eyebrow="01 — Campaign Brief" title="Guter Content beginnt nicht mit „Was posten wir heute?“">
        <p>
          Bevor ein Motiv entsteht, steht fest, wofür die Kampagne da ist. Das Ziel bestimmt
          die Zielgruppe, die Botschaft und das Format. Wechsle das Ziel und beobachte die Kette.
        </p>
      </ModuleHeading>

      <div className="mk-brief__studio">
        <article className="mk-brief__doc" aria-label="Campaign Brief VERDE">
          <header className="mk-brief__doc-head">
            <span className="mk-brief__doc-brand">
              <VerdeMark />
              <span>
                <b>VERDE</b>
                <small>Frühjahrskampagne · Entwurf</small>
              </span>
            </span>
            <span className="mk-brief__doc-tag">Fiktives Beispiel</span>
          </header>

          <div aria-label="Kampagnenziel wählen" className="mk-brief__switch" role="group">
            <span>Ziel der Kampagne</span>
            <div>
              {OBJECTIVES.map((item) => (
                <button
                  aria-pressed={objective === item.id}
                  className={objective === item.id ? 'is-selected' : ''}
                  key={item.id}
                  onClick={() => setObjective(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <ol aria-label="Kampagnenlogik" className="mk-brief__fields">
            {brief.fields.map(([label, value, note, icon], index) => (
              <li className="mk-brief__field" key={label}>
                <span className="mk-brief__field-icon" aria-hidden="true"><PhoneIcon name={icon} /></span>
                <span className="mk-brief__field-label">
                  <em>{CONNECTORS[index]}</em>
                  {label}
                </span>
                <AnimatePresence initial={false} mode="wait">
                  <motion.span
                    {...swap}
                    className="mk-brief__field-value"
                    key={`${objective}-${value}`}
                    transition={{ duration: reducedMotion ? 0.01 : 0.28, delay: reducedMotion ? 0 : index * 0.03, ease: EASE }}
                  >
                    <strong>{value}</strong>
                    <small>{note}</small>
                  </motion.span>
                </AnimatePresence>
              </li>
            ))}
          </ol>
        </article>

        <ol aria-label="Strategische Kette" aria-live="polite" className="mk-brief__chain">
          {brief.chain.map(([label, value, note], index) => (
            <li key={label}>
              <span className="mk-brief__chain-index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="mk-brief__chain-label">{label}</span>
              <AnimatePresence initial={false} mode="wait">
                <motion.span
                  {...swap}
                  className="mk-brief__chain-value"
                  key={`${objective}-${label}`}
                  transition={{ duration: reducedMotion ? 0.01 : 0.34, delay: reducedMotion ? 0 : 0.08 + index * 0.09, ease: EASE }}
                >
                  <strong>{value}</strong>
                  <small>{note}</small>
                </motion.span>
              </AnimatePresence>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
