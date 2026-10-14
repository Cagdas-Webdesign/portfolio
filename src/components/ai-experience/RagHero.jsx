import { askAssistant } from './askAssistant.js';
import HeroPhone from './HeroPhone.jsx';
import { RAG_BACKEND_REPOSITORY_URL } from '../../siteConfig.js';

// Diese Section zeigt das RAG-Backend — daher dessen Repository.
const REPOSITORY_URL = RAG_BACKEND_REPOSITORY_URL;

/*
 * 01 — Hero: Text links, rechts das echte Produkt (HeroPhone: Smartphone
 * mit der Startansicht des Assistenten). Handy: Titel → Subtitle → Text
 * → Actions → Smartphone.
 */
export default function RagHero() {
  return (
    <div className="rx-hero">
      <div className="rx-hero__copy">
        <h2 className="rx-hero__title" id="ai-assistant-title">
          AI Portfolio
          <br />
          Assistant
        </h2>
        <p className="rx-hero__subtitle">
          Powered by a <strong>Custom RAG Backend</strong>
        </p>
        <p className="rx-hero__lead">
          Kein Standard-Chatbot. Ein eigenes Retrieval-System, das Wissen findet, Kontext begrenzt,
          Antworten an Quellen bindet und ehrlich sagt, wenn es etwas nicht weiß.
        </p>
        <div className="rx-hero__actions">
          <button className="ai-open-chat rx-cta" onClick={() => askAssistant('')} type="button">
            <span aria-hidden="true" className="rx-cta__mark">✦</span>
            Assistent ausprobieren
          </button>
          <a
            className="rx-repo"
            href={REPOSITORY_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg aria-hidden="true" className="rx-repo__icon" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.51 2.87 8.34 6.84 9.69.5.1.68-.22.68-.49l-.01-1.71c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.28 9.28 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.79-4.57 5.04.36.32.68.94.68 1.9l-.01 2.82c0 .27.18.6.69.49A10.06 10.06 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
            </svg>
            <span>Open Repository</span>
            <svg aria-hidden="true" className="rx-repo__arrow" viewBox="0 0 24 24">
              <path d="M5 12h13M12.5 6l5.5 6-5.5 6" />
            </svg>
          </a>
        </div>
      </div>

      <div className="rx-hero__visual">
        <HeroPhone />
      </div>
    </div>
  );
}
