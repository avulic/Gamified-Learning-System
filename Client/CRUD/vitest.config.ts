import { defineConfig as defineViteConfig, UserConfig } from 'vite'
import { defineConfig as defineVitestConfig } from 'vitest/config'
import viteConfig from './vite.config'
import { fileURLToPath } from 'url'

export default defineViteConfig({
  ...viteConfig,
  test: {
    ...((viteConfig as UserConfig).test || {}),
    environment: 'jsdom',
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      transformMode: {
        web: [/\.[jt]sx$/]
      }
    }
  } as UserConfig)
