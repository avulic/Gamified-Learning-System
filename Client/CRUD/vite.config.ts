import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  publicDir: 'public',
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist'
  },
  server: {
    host: true,
    port: 8080,
    open:true,
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
