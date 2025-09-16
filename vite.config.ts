import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/PokerSnap/',   // <- repo name (case-sensitive)
  plugins: [react()],
})
