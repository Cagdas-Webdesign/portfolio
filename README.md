# Portfolio Çağdaş Uçar

Persönliches Portfolio als Single-Page-App mit React 19 und Vite 8, inklusive
Portfolio Assistant (Anbindung an das eigene RAG-Backend
[portfolio-rag-backend](https://github.com/Cagdas-Webdesign/portfolio-rag-backend)).

## Entwicklung

Node.js `^20.19.0 || >=22.12.0` (siehe `.nvmrc`).

```bash
npm install
npm run dev      # http://localhost:5173
npm run lint     # oxlint
npm test         # node:test
npm run build    # Ausgabe in dist/
```

## Konfiguration

| Wo | Was |
| --- | --- |
| `src/siteConfig.js` | Kontakt-E-Mail, GitHub-Profil, Repository-URLs (Portfolio und RAG-Backend) |
| `.env.local` (nicht im Repo) | `VITE_RAG_API_URL` (Cloudflare-Worker-Endpoint) und `VITE_TURNSTILE_SITE_KEY` — Vorlage: `.env.example` |

Die `VITE_*`-Werte landen im Browser-Bundle und sind öffentlich; dort gehören
keine Secrets hinein. Sie müssen beim **Build** gesetzt sein — sonst ist der
Portfolio Assistant im Build nicht verbunden.

## Deployment (GitHub Pages)

`vite.config.js` nutzt `base: './'`: Der Build funktioniert unter jedem Pfad
(`https://<user>.github.io/<repo>/`), ohne den Repository-Namen zu kennen.
Dateien aus `public/` werden im Code immer über `import.meta.env.BASE_URL`
referenziert, nie mit führendem `/`. `public/.nojekyll` verhindert die
Jekyll-Verarbeitung durch GitHub Pages.

Workflow: `.github/workflows/deploy-pages.yml` — wird nur manuell gestartet
(Actions → „Deploy to GitHub Pages“ → Run workflow). Vorher einmalig
`VITE_RAG_API_URL` und `VITE_TURNSTILE_SITE_KEY` als Repository-*Variables*
anlegen und unter Settings → Pages als Source „GitHub Actions“ wählen.
Live-URL: https://cagdas-webdesign.github.io/portfolio/

## Aufbau

- `src/components/` — Sections, Pop-ups, Assistant, Footer, Impressum/Datenschutz
- `src/styles/` — Stylesheets; `base.css`/`patches.css` sind die historisch
  gewachsenen Grundschichten (Import-Reihenfolge in `src/main.jsx` beachten)
- `public/legacy/block-NN.js` — ältere Skripte, die `src/legacy/loadLegacyScripts.js`
  nach Index lädt. Leere Blöcke bleiben als Datei bestehen, weil die
  Ladereihenfolge am Index hängt.
- `src/services/githubRelease.js` — neuester GitHub-Release über die öffentliche
  API (ohne Token, nur In-Memory-Cache)

GSAP und ScrollTrigger kommen aus npm und werden für die Legacy-Skripte als
`window.gsap` / `window.ScrollTrigger` bereitgestellt (`src/main.jsx`).
