import { useState } from 'react';
import { useOnceInView } from './hooks.js';

const ROBOT_HEAD_IMAGE = `${import.meta.env.BASE_URL}ai-robot-head.png`;
// -v2: Green-Screen-Reste an den oberen Rahmenecken entfernt (neuer Name, damit
// Browser-Caches die alte Datei nicht weiter zeigen).
const DEVICE_PHOTO = `${import.meta.env.BASE_URL}assets/ai-assistant-hand-phone-v2.webp`;

// Einstiegsfragen im Stil der echten .ai-chat-suggestion (ohne Icons)
const SUGGESTIONS = ['Was kann Çağdaş?', 'Wie bindet er APIs an?', 'Wie automatisiert er Prozesse?', 'Wie setzt er digitale Systeme um?'];

/* ==================================================================
 * Hero-Visual: das echte Produkt statt einer Prozessgrafik.
 *
 * Foto (Hand + kupferfarbenes Pro-Max-artiges Smartphone, Display
 * schwarz) als Buehne; das Display selbst ist HTML/CSS und bildet die
 * Startansicht des echten AiAssistantWidget nach (Neural Blue). Rein
 * dekorativ — die echte Interaktion bleibt der CTA links bzw. der
 * Floating-Button.
 *
 * Foto 650×1090: Innenkante des Rahmens x 101–487, y 71–881. Die
 * Prozentwerte in .rx-phone leiten sich daraus ab.
 * Bewegung: einmaliger Einstieg, danach ruhig.
 * ================================================================== */
export default function HeroPhone() {
  const [entered, setEntered] = useState(false);
  const ref = useOnceInView(() => setEntered(true), 0.25);

  return (
    <div aria-hidden="true" className={`rx-device${entered ? ' is-in' : ''}`} ref={ref}>
      <img
        alt=""
        className="rx-device__photo"
        decoding="async"
        height="1090"
        loading="lazy"
        src={DEVICE_PHOTO}
        width="650"
      />

      <div className="rx-phone">
        <div className="rx-phone__glass">
          <div className="rx-phone__screen">
            <span className="rx-phone__island" />
            <div className="rx-phone__status">
              <span>9:41</span>
              <span className="rx-phone__icons">
                <svg viewBox="0 0 18 12"><rect height="4" rx="1" width="3" x="0" y="8" /><rect height="6" rx="1" width="3" x="5" y="6" /><rect height="9" rx="1" width="3" x="10" y="3" /><rect height="12" rx="1" width="3" x="15" y="0" /></svg>
                <svg className="is-wifi" viewBox="0 0 16 12"><path d="M1.2 4.3a9.8 9.8 0 0 1 13.6 0M3.7 7a6.2 6.2 0 0 1 8.6 0M6.2 9.7a2.6 2.6 0 0 1 3.6 0" /></svg>
                <svg viewBox="0 0 26 12"><rect fill="none" height="11" rx="3" stroke="currentColor" strokeOpacity="0.45" width="22" x="0.5" y="0.5" /><rect height="8" rx="1.6" width="17" x="2" y="2" /><rect height="4" rx="1" width="2" x="24" y="4" /></svg>
              </span>
            </div>

            {/* Kopfzeile wie .ai-chat-header */}
            <div className="rx-app__header">
              <span className="rx-app__orb">
                <img alt="" decoding="async" height="320" loading="lazy" src={ROBOT_HEAD_IMAGE} width="320" />
              </span>
              <span className="rx-app__brand">
                <b>AI Portfolio Assistant</b>
                <span><i /> Portfolio Scanner</span>
              </span>
              <span className="rx-app__close">
                <svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" /></svg>
              </span>
            </div>

            <div className="rx-app__messages">
              <p className="rx-app__bubble">
                Hi, ich bin der AI Portfolio Assistant von Çağdaş. Frag mich nach Skills, Webdesign,
                WordPress, Automationen, APIs, Chatbots oder Social Media.
              </p>
            </div>

            <div className="rx-app__prompts">
              {SUGGESTIONS.map((text) => <span key={text}>{text}</span>)}
            </div>

            {/* Eingabe wie .ai-chat-form */}
            <div className="rx-app__form">
              <span className="rx-app__input">Frage zu Çağdaş stellen…</span>
              <span className="rx-app__send">
                <svg viewBox="0 0 24 24"><path d="M5 12h12M13 6l6 6-6 6" /></svg>
              </span>
            </div>
            <span className="rx-phone__home" />
          </div>
        </div>
      </div>
    </div>
  );
}
