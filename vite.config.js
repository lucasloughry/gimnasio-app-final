import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    }
  },
  plugins: [
    react(),
    // Configuración del plugin de PWA
    VitePWA({
      registerType: 'autoUpdate',
      // Archivos a cachear para que la app funcione sin conexión
      includeAssets: ['orbital-white-192.png', 'orbital-favicon-white.png', 'orbital-apple-touch.png'],
      manifest: {
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        lang: 'es-AR',
        name: 'Orbital',
        short_name: 'Orbital',
        description: 'Tu universo de entrenamientos.',
        theme_color: '#020617',
        background_color: '#020617',
        // Íconos de la aplicación que crearemos en el siguiente paso
        icons: [
          {
            src: 'orbital-white-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'orbital-white-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'orbital-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ]
})
