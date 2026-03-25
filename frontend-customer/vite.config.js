import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api/grocery': {
        target: 'https://grocery-backend.livelyforest-bef090db.eastus.azurecontainerapps.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/grocery/, '/api'),
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})
