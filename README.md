# Portfolio Çağdaş — React Migration (Phase 1)

1:1 migration of the original single-file portfolio (`../index (6).html`) into
Vite + React. **No redesign** — markup, CSS cascade and animation behavior are
kept identical to the source.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Structure

- `src/components/` — the original body markup split into React components
  (Hero, Funnel, CodeSection, Experience, NestedOffers, AiAssistant,
  Certificate, SocialLottie, ReelsShowcase, SystemStory, Automation,
  ContentEngine, Contact, Footer, Nav, Cursor, AiAssistantWidget), rendered
  in the original document order by `App.jsx`.
- `src/styles/base.css` — all `<style>` blocks that lived in the original
  `<head>`, in document order.
- `src/styles/patches.css` — all versioned `<style>` patch blocks that
  followed the markup, in document order. **Import order matters** — it
  reproduces the original cascade (see `src/main.jsx`).
- `public/legacy/block-NN.js` — the 45 original inline `<script>` blocks,
  untouched. `src/legacy/loadLegacyScripts.js` loads them sequentially as
  classic scripts after React mounts (same shared-global-scope semantics as
  the original page) and replays `DOMContentLoaded`/`load` for late listeners.
- `public/videos/` — the four marketing reels (`instagram`, `tiktok`,
  `linkedin`, `whatsapp`), converted from the `.mov` screen recordings.
- `scripts/extract.mjs` — the one-time extractor that generated components,
  styles and legacy blocks from the source file. Re-running it overwrites the
  generated files (manual follow-up edits: Footer split out of Contact, video
  paths rewritten to `/videos/`).

GSAP + ScrollTrigger come from npm and are exposed as `window.gsap` /
`window.ScrollTrigger` for the legacy scripts (`src/main.jsx`).

## Phase 2 (not started — pending approval)

Componentize the legacy patch CSS/JS properly, move animations into React
(Framer Motion), deduplicate the versioned patch layers.
