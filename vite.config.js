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
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Gimnasio Municipal',
        short_name: 'GymApp',
        description: 'Aplicación de seguimiento para el Gimnasio Municipal.',
        theme_color: '#ffffff',
        // Íconos de la aplicación que crearemos en el siguiente paso
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
