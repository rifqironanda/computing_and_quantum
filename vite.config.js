import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { proxy: { '/api': { target: 'http://127.0.0.1:8000', timeout: 140000, proxyTimeout: 140000 } } },
  preview: { proxy: { '/api': { target: 'http://127.0.0.1:8000', timeout: 140000, proxyTimeout: 140000 } } },
})
