import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite liest PORT nicht von sich aus. Ohne das hier startet jeder
// Dev-Server auf 5173 und ein zweiter kollidiert mit dem ersten.
const port = Number(process.env.PORT) || 5173

// https://vite.dev/config/
export default defineConfig({
  // Relativer Base-Pfad: der Build laeuft unter jedem GitHub-Pages-Pfad
  // (https://<user>.github.io/<repo>/) ohne den Repo-Namen zu kennen.
  // Oeffentliche Dateien im Code immer ueber import.meta.env.BASE_URL.
  base: './',
  plugins: [react()],
  server: { port },
})
