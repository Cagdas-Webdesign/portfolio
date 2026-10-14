import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ASK_EVENT } from './ai-experience/askAssistant.js';
import { SourceChips, SourcePopover } from './AssistantSources.jsx';
import { stripSourceMarkers } from './stripSourceMarkers.js';
import AssistantThemeMenu from './AssistantThemeMenu.jsx';
import { useAssistantFullscreen } from '../hooks/useAssistantFullscreen.js';
import { useFloatingCollision } from '../hooks/useFloatingCollision.js';
import { useAssistantTheme } from '../hooks/useAssistantTheme.js';
import { usePortfolioAssistant } from '../hooks/usePortfolioAssistant.js';
import { MAX_MESSAGE_LENGTH } from '../services/ragApi.js';
import '../styles/assistant-rag.css';
import '../styles/assistant-themes.css';

const ROBOT_HEAD_IMAGE = `${import.meta.env.BASE_URL}ai-robot-head.png`;

/** Bis zu diesem Abstand vom unteren Rand gilt der Nutzer als "unten". */
const NEAR_BOTTOM_PX = 72;

/** Quick Prompt → Frage: das fuehrende Emoji gehoert zur Beschriftung, nicht zur Frage. */
function promptQuestion(button) {
  return (button.textContent || '').replace(/^[^\p{L}\p{N}]+/u, '').trim();
}

export default function AiAssistantWidget({ sectionVisible }) {
  const widgetRef = useRef(null);
  const messagesRef = useRef(null);
  const sliderRef = useRef(null);
  const inputRef = useRef(null);
  const turnstileRef = useRef(null);
  const bodyRef = useRef(null);
  const panelRef = useRef(null);
  const backdropRef = useRef(null);
  const wasPending = useRef(false);
  const stickToBottom = useRef(true);
  const renderedCount = useRef(0);
  const [input, setInput] = useState('');
  const [openSource, setOpenSource] = useState(null);
  const { messages, pending, ask } = usePortfolioAssistant({ turnstileRef });
  const { fullscreen, toggle: toggleFullscreen, exit: exitFullscreen } = useAssistantFullscreen(panelRef, backdropRef, messagesRef);
  // Nur ein Attribut am Widget — kein Remount, Chat-Zustand bleibt unberuehrt.
  const { theme, setTheme } = useAssistantTheme();

  // Schliessen im Vollbild: erst ausblenden lassen (Legacy-Handler, 240 ms),
  // dann ohne Animation andocken — sonst sprang das Panel sichtbar zurueck.
  const handleClose = () => {
    if (fullscreen) setTimeout(() => exitFullscreen({ animate: false }), 260);
  };

  const openCitation = openSource
    ? messages.find((message) => message.id === openSource.messageId)?.citations?.[openSource.index]
    : null;

  // Immer nur eine Quelle offen; erneuter Klick auf denselben Chip schliesst.
  const toggleSource = useCallback((source, viaKeyboard) => {
    setOpenSource((current) => (
      current?.messageId === source.messageId && current.index === source.index
        ? null
        : { ...source, viaKeyboard }
    ));
  }, []);

  const closeSource = useCallback((restoreFocus) => {
    if (openSource && restoreFocus) {
      bodyRef.current
        ?.querySelector(`[data-source-chip="${openSource.messageId}:${openSource.index}"]`)
        ?.focus();
    }
    setOpenSource(null);
  }, [openSource]);

  // Liegt die Slider-Pagination der Leistungs-Section unter dem Button,
  // weicht er kurz aus (gleiche Ausblendung wie bei sichtbarer AI-Section).
  const yieldToPagination = useFloatingCollision(widgetRef, '.ai-chat-toggle', '#services-capabilities .sc-pagination');

  const widgetClassName = [
    'ai-assistant-widget',
    sectionVisible ? 'assistant-widget--section-visible' : '',
    yieldToPagination ? 'assistant-widget--yield' : '',
  ].filter(Boolean).join(' ');

  // Merken, ob der Nutzer unten ist — vor jeder Aenderung, nicht danach.
  // Schrumpft der Nachrichtenbereich (Slider klappt auf, Fenstergroesse), bleibt
  // das Ende sichtbar, statt hinter Slider und Composer zu rutschen.
  useEffect(() => {
    const list = messagesRef.current;
    if (!list) return undefined;
    const onScroll = () => {
      stickToBottom.current = list.scrollHeight - list.scrollTop - list.clientHeight <= NEAR_BOTTOM_PX;
    };
    list.addEventListener('scroll', onScroll, { passive: true });
    const observer = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => {
        if (stickToBottom.current) list.scrollTop = list.scrollHeight;
      });
    observer?.observe(list);
    return () => {
      list.removeEventListener('scroll', onScroll);
      observer?.disconnect();
    };
  }, []);

  // Neue Inhalte: eigene Frage → immer ans Ende. Antwort/Ladeanzeige → nur wenn
  // der Nutzer unten war; eine lange Antwort wird an ihrem Anfang gezeigt.
  useLayoutEffect(() => {
    const list = messagesRef.current;
    if (!list) return;
    const last = messages[messages.length - 1];
    const added = messages.length > renderedCount.current;
    renderedCount.current = messages.length;

    if (added && last?.role === 'user') {
      stickToBottom.current = true;
      list.scrollTop = list.scrollHeight;
      return;
    }
    if (!stickToBottom.current) return;

    const bottom = list.scrollHeight - list.clientHeight;
    const element = added && last ? list.querySelector(`[data-message-id="${last.id}"]`) : null;
    if (!element) {
      list.scrollTop = bottom;
      return;
    }
    const offset = element.getBoundingClientRect().top - list.getBoundingClientRect().top;
    list.scrollTop = Math.min(bottom, list.scrollTop + offset - 12);
  }, [messages, pending]);

  useEffect(() => {
    if (wasPending.current && !pending) inputRef.current?.focus();
    wasPending.current = pending;
  }, [pending]);

  const submitQuestion = async (question, options) => {
    if (!String(question ?? '').trim() || pending) return false;
    // Wie bisher: Chat oeffnen und auf Desktop die Prompt-Vorschlaege einklappen.
    widgetRef.current?.classList.add('is-open');
    if (sliderRef.current && window.innerWidth > 920) sliderRef.current.classList.add('is-collapsed');
    return ask(question, options);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const question = input;
    if (!question.trim() || pending) return;
    setInput('');
    submitQuestion(question).then((accepted) => {
      if (!accepted) setInput((current) => current || question);
    });
  };

  /*
   * „✦ Assistent fragen“ aus der RAG-Experience: Chat oeffnen, Frage ins
   * Eingabefeld setzen, NICHT senden. Der Nutzer schickt selbst ab.
   * Reine UI — Request, Turnstile und RAG-Logik bleiben unveraendert.
   */
  useEffect(() => {
    const onAsk = (event) => {
      const { question = '' } = event.detail || {};
      widgetRef.current?.classList.add('is-open');
      if (question) setInput(question);
      window.setTimeout(() => {
        const field = inputRef.current;
        if (!field) return;
        field.focus({ preventScroll: true });
        field.setSelectionRange(field.value.length, field.value.length);
      }, 200);
    };
    window.addEventListener(ASK_EVENT, onAsk);
    return () => window.removeEventListener(ASK_EVENT, onAsk);
  }, []);

  const handleSuggestion = (event) => {
    submitQuestion(promptQuestion(event.currentTarget));
  };

  return (
    <div
      className={widgetClassName}
      data-assistant-theme={theme}
      data-fullscreen={fullscreen ? 'true' : undefined}
      id="aiAssistantWidget"
      ref={widgetRef}
    >
      <div aria-hidden="true" className="ai-chat-fs-backdrop" onClick={() => exitFullscreen()} ref={backdropRef} />

      <div aria-label="AI Portfolio Assistant" aria-modal="false" className="ai-chat-panel" ref={panelRef} role="dialog">
        <div className="ai-chat-header">
          <div className="ai-chat-brand">
            <div className="ai-chat-orb">
              <img alt="" decoding="async" height="320" src={ROBOT_HEAD_IMAGE} width="320" />
            </div>
            <div>
              <b>AI Portfolio Assistent</b>
              <span>
                <i /> Portfolio Scanner
              </span>
            </div>
          </div>
          <div className="ai-chat-header-actions">
            <AssistantThemeMenu onSelect={setTheme} theme={theme} />
            <button
              aria-label={fullscreen ? 'Vollbild verlassen' : 'Assistant im Vollbild öffnen'}
              className="ai-chat-fullscreen"
              onClick={toggleFullscreen}
              type="button"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path
                  d={fullscreen
                    ? 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5'
                    : 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5'}
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
            <button aria-label="Chat schließen" className="ai-chat-close" onClick={handleClose} type="button">
              <span />
              <span />
            </button>
          </div>
        </div>

        <div className="ai-chat-body" ref={bodyRef}>
          <div aria-busy={pending} aria-live="polite" className="ai-chat-messages" id="aiChatMessages" ref={messagesRef}>
            <div className="ai-chat-message bot">
              Hi, ich bin der AI-Portfolio-Assistent von Çağdaş. Frag mich nach Skills, Webdesign,
              WordPress, Automationen, APIs, Chatbots oder Social Media.
            </div>

            {messages.map((message) => (
              <div className={`ai-chat-message ${message.role}`} data-message-id={message.id} key={message.id}>
                {/* Interne Labels wie (S3, S7) nur in der Anzeige entfernen;
                    message.text und citations bleiben unveraendert. */}
                {message.kind === 'answer' ? stripSourceMarkers(message.text) : message.text}
                {message.kind === 'answer' && (
                  <SourceChips
                    citations={message.citations}
                    messageId={message.id}
                    onToggle={toggleSource}
                    openSource={openSource}
                  />
                )}
                {message.kind === 'error' && message.retryQuestion && (
                  <button
                    className="ai-chat-retry"
                    disabled={pending || message.cooldown}
                    onClick={() => submitQuestion(message.retryQuestion, { retryOf: message.id })}
                    type="button"
                  >
                    Erneut senden
                  </button>
                )}
              </div>
            ))}

            {pending && (
              <div aria-label="Antwort wird geladen" className="ai-chat-message bot loading">
                <i />
                <i />
                <i />
              </div>
            )}
          </div>

          {openSource && openCitation && (
            <SourcePopover
              citation={openCitation}
              containerRef={bodyRef}
              focusOnOpen={openSource.viaKeyboard}
              onClose={closeSource}
              scrollRef={messagesRef}
              source={openSource}
            />
          )}

          <div aria-label="Beispielfragen" className="ai-prompt-slider" ref={sliderRef}>
            <button aria-label="Prompt-Vorschlaege ein- oder ausklappen" className="ai-prompt-pull" type="button">
              <span />
            </button>

            <div className="ai-prompt-track" data-active-slide="0" data-keep-text="">
              <div className="ai-prompt-page is-active" data-slide="0">
                <button className="ai-chat-suggestion" onClick={handleSuggestion} type="button">✨ Was kann Çağdaş?</button>
                <button className="ai-chat-suggestion" onClick={handleSuggestion} type="button">🔌 Wie bindet er APIs an?</button>
                <button className="ai-chat-suggestion" onClick={handleSuggestion} type="button">🤖 Welche Technologie steckt hinter diesem Chatbot?</button>
                <button className="ai-chat-suggestion" onClick={handleSuggestion} type="button">🌐 Welche Technologie steckt hinter dieser Website?</button>
                <button className="ai-chat-suggestion" onClick={handleSuggestion} type="button">🛒 Kann er Online-Shops umsetzen?</button>
                <button className="ai-chat-suggestion" onClick={handleSuggestion} type="button">📱 Was kann er mit Social Media?</button>
              </div>

              <div className="ai-prompt-page" data-slide="1">
                <button className="ai-chat-suggestion" onClick={handleSuggestion} type="button">🚀 Wie setzt er digitale Systeme um?</button>
                <button className="ai-chat-suggestion" onClick={handleSuggestion} type="button">📩 Kann er Newsletter anbinden?</button>
                <button className="ai-chat-suggestion" onClick={handleSuggestion} type="button">🧩 Kann er Custom WordPress Plugins schreiben?</button>
                <button className="ai-chat-suggestion" onClick={handleSuggestion} type="button">🗄️ Welche Datenbanken kennt er?</button>
                <button className="ai-chat-suggestion" onClick={handleSuggestion} type="button">💼 Welche Qualifikationen hat er?</button>
                <button className="ai-chat-suggestion" onClick={handleSuggestion} type="button">⚡ Wie optimiert er Websites für Performance?</button>
              </div>
            </div>

            <div aria-label="Prompt-Slider Steuerung" className="ai-prompt-controls">
              <button aria-label="Vorherige Prompt-Seite" className="ai-prompt-arrow ai-prompt-prev" type="button">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M14.5 6.5 9 12l5.5 5.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" />
                </svg>
              </button>
              <div aria-label="Prompt-Seite wechseln" className="ai-prompt-pagination">
                <button aria-label="Prompt-Seite 1" className="ai-prompt-dot is-active" data-slide="0" type="button" />
                <button aria-label="Prompt-Seite 2" className="ai-prompt-dot" data-slide="1" type="button" />
              </div>
              <button aria-label="Naechste Prompt-Seite" className="ai-prompt-arrow ai-prompt-next" type="button">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M9.5 6.5 15 12l-5.5 5.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" />
                </svg>
              </button>
            </div>
          </div>

          {/* Turnstile (Invisible) rendert hier pro Anfrage; der Container ist nie sichtbar. */}
          <div aria-hidden="true" className="ai-chat-turnstile" ref={turnstileRef} />

          <form className="ai-chat-form" id="aiChatForm" onSubmit={handleSubmit}>
            <input
              autoComplete="off"
              disabled={pending}
              id="aiChatInput"
              maxLength={MAX_MESSAGE_LENGTH}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Frage zu Çağdaş stellen..."
              ref={inputRef}
              type="text"
              value={input}
            />
            <button aria-label="Nachricht senden" disabled={pending} type="submit">
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M5 12h12M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.35" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      <button aria-label="AI Portfolio Assistent öffnen" className="ai-chat-toggle" type="button">
        <img
          alt=""
          className="ai-chat-toggle-image"
          decoding="async"
          height="320"
          src={ROBOT_HEAD_IMAGE}
          width="320"
        />
      </button>
    </div>
  );
}
