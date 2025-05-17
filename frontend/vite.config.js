import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  },
  build: {
    sourcemap: true
  },
  css: {
    devSourcemap: true
  }
})

