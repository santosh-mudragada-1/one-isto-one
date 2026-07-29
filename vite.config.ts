import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // The logo assets already live in `Public/` (capital P) — point Vite at them
  // rather than renaming a folder the client already has open.
  publicDir: 'Public',
  // Relative so the same build works at the domain root AND under a
  // GitHub Pages project path (/one-isto-one/). Anything referencing a
  // file in Public/ must go through import.meta.env.BASE_URL.
  base: './',
  server: { port: 5173, open: true },
})
