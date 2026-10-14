import { useEffect, useRef, useState } from 'react';
import { ASSISTANT_THEMES } from '../hooks/useAssistantTheme.js';

// Design-Button im Header und das Popover mit den vier Presets.
// Auswahl nach dem Radio-Muster: Pfeiltasten wechseln und uebernehmen sofort
// (Live-Vorschau), Escape oder Klick ausserhalb schliessen.

const THEME_MENU_ID = 'aiThemeMenu';

/**
 * @param {{ theme: string, onSelect: (id: string) => void }} props
 */
export default function AssistantThemeMenu({ theme, onSelect }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  // Beim Oeffnen das aktive Preset fokussieren.
  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector('[aria-checked="true"]')?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    // window + Capture: laeuft vor den Escape-Handlern von Quellen-Popover,
    // Vollbild und Legacy-Chat — Escape schliesst zuerst nur dieses Menue.
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus({ preventScroll: true });
    };
    const onPointerDown = (event) => {
      if (menuRef.current?.contains(event.target) || buttonRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    // Fokus verlaesst das Menue (z. B. Tab): schliessen, keine Fokusfalle.
    const onFocusIn = (event) => {
      if (menuRef.current?.contains(event.target) || buttonRef.current?.contains(event.target)) return;
      setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('focusin', onFocusIn);
    };
  }, [open]);

  const moveSelection = (event, index) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = ASSISTANT_THEMES[(index + step + ASSISTANT_THEMES.length) % ASSISTANT_THEMES.length];
    onSelect(next.id);
    menuRef.current?.querySelector(`[data-theme-option="${next.id}"]`)?.focus({ preventScroll: true });
  };

  return (
    <div className="ai-theme-switcher">
      <button
        aria-controls={open ? THEME_MENU_ID : undefined}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Assistant-Design ändern"
        className="ai-chat-theme-button"
        onClick={() => setOpen((current) => !current)}
        ref={buttonRef}
        type="button"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path
            d="M12 3.5a8.5 8.5 0 1 0 0 17c1.1 0 1.75-.8 1.75-1.7 0-.45-.17-.83-.44-1.13-.26-.3-.43-.67-.43-1.12 0-.93.76-1.7 1.7-1.7h1.97a3.9 3.9 0 0 0 3.9-3.9C20.45 6.9 16.67 3.5 12 3.5Z"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <circle cx="7.6" cy="11.6" fill="currentColor" r="1.25" />
          <circle cx="10.2" cy="7.7" fill="currentColor" r="1.25" />
          <circle cx="14.6" cy="7.9" fill="currentColor" r="1.25" />
        </svg>
      </button>

      {open && (
        <div aria-label="Design ändern" className="ai-theme-menu" data-keep-text="" id={THEME_MENU_ID} ref={menuRef} role="dialog">
          <p className="ai-theme-menu-title">Design ändern</p>
          <div aria-label="Design-Presets" className="ai-theme-options" role="radiogroup">
            {ASSISTANT_THEMES.map((option, index) => {
              const active = option.id === theme;
              return (
                <button
                  aria-checked={active}
                  className={`ai-theme-option${active ? ' is-active' : ''}`}
                  data-theme-option={option.id}
                  key={option.id}
                  onClick={() => onSelect(option.id)}
                  onKeyDown={(event) => moveSelection(event, index)}
                  role="radio"
                  tabIndex={active ? 0 : -1}
                  type="button"
                >
                  <span aria-hidden="true" className="ai-theme-swatch">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="ai-theme-option-text">
                    <span className="ai-theme-option-name">{option.label}</span>
                    <span className="ai-theme-option-description">{option.description}</span>
                  </span>
                  <svg aria-hidden="true" className="ai-theme-option-check" viewBox="0 0 24 24">
                    <path d="m5.5 12.5 4.2 4.2L18.5 7.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
