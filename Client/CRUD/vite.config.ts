import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    port: 8080,
    watch: {
      usePolling: true
    },
    proxy: { 
      "/api": { 
      target: "http://localhost:4000", 
      changeOrigin: true, 
      secure: false, 
      rewrite: (path) => path.replace(/^\/api/, ""), 
      }, 
    }
  }
})
