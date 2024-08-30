import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  define: {
    'process.env.VITE_API_BASE': JSON.stringify(process.env.VITE_API_BASE),
    'process.env.VITE_PUSHER_KEY': JSON.stringify(process.env.VITE_PUSHER_KEY),
    'process.env.VITE_PUSHER_CLUSTER': JSON.stringify(process.env.VITE_PUSHER_CLUSTER),
  }
})
