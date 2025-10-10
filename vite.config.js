import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5175,
    // allow any ngrok-free.app subdomain so you don't have to edit every time
    allowedHosts: [/^[a-z0-9-]+\.ngrok-free\.app$/],
  }
})