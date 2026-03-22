import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Delivery backend (port 5003) — must come BEFORE '/api'
      '/delivery': {
        target: 'http://localhost:5003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/delivery/, ''),
      },
      // Socket.io for real-time delivery updates
      '/socket.io': {
        target: 'http://localhost:5003',
        changeOrigin: true,
        ws: true,
      },
      // Your existing backend (port 5000)
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})