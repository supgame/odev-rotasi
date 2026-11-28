import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  root: resolve(process.cwd(), 'gelistirme/faz8_kontrol'),
  publicDir: resolve(process.cwd(), 'public'),
  base: './',
  plugins: [react()],
  build: {
    outDir: '/tmp/faz8-kontrol-static',
    emptyOutDir: true,
    rollupOptions: { input: resolve(process.cwd(), 'gelistirme/faz8_kontrol/index.html') },
  },
})
