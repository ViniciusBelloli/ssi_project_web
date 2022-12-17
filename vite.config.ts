import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dns from 'dns'

dns.setDefaultResultOrder('verbatim')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 9000,
    strictPort: true,
    hmr: {
      host: 'http://172.22.56.176/',
      port: 80,
      protocol: 'wss',
    },
  },
})
