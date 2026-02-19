import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwind(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    },
    headers: {
      'Content-Security-Policy': 'default-src \'self\' \'unsafe-inline\' \'unsafe-eval\' data: blob:; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' data: blob:; style-src \'self\' \'unsafe-inline\' data: blob: https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src \'self\' data: blob:; connect-src \'self\' ws: wss: http: https: http://localhost:8000;'
    }
  }
})
