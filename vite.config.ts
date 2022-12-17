import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import dns from 'dns'

dns.setDefaultResultOrder('verbatim')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    port: 9000,
    strictPort: true,
    host: true,
    https: true,
    hmr: {
      host: '172.22.56.176',
      port: 3000,
      protocol: 'wss',
    },
  },
})
