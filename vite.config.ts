import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-htaccess',
      writeBundle() {
        try {
          const htaccessPath = resolve(__dirname, '.htaccess')
          const distPath = resolve(__dirname, 'dist')
          if (!existsSync(distPath)) {
            mkdirSync(distPath, { recursive: true })
          }
          if (existsSync(htaccessPath)) {
            copyFileSync(htaccessPath, resolve(distPath, '.htaccess'))
          }
        } catch (e) {
        }
      }
    }
  ],
  server: {
    port: 8080,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'utils': ['date-fns', 'zustand'],
          'dashboard': [
            './src/pages/Dashboard.tsx',
            './src/pages/dashboard/Profile.tsx',
            './src/pages/dashboard/Reservations.tsx',
            './src/pages/dashboard/Settings.tsx'
          ],
          'admin': [
            './src/pages/dashboard/admin/Users.tsx',
            './src/pages/dashboard/admin/Spaces.tsx',
            './src/pages/dashboard/admin/Reservations.tsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'date-fns']
  }
})
