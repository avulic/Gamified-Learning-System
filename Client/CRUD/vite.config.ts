import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills()
  ],
  publicDir: 'public',
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    dedupe: ['rxjs']
  },
  optimizeDeps: {
    exclude: ['zlib'],
    include: ['rxjs']
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
    commonjsOptions: { transformMixedEsModules: true }
  },
  server: {
    host: true,
    port: 8080,
    open: true,
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
      "/quests": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
