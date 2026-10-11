import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/Web_Game_Catalog/',
  plugins: [react()],
  server: {
    proxy: {
      '/google-sheets': {
        target: 'https://docs.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/google-sheets/, ''),
      },
    },
  },
})
