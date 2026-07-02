import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Brand assets live ONLY in the S3 assets bucket (served via CloudFront
      // under /brand/*, see infrastructure/terraform/assets.tf). Proxy them in
      // dev so no image copies are needed in the repo.
      '/brand': {
        target: 'https://www.hagroup.lv',
        changeOrigin: true,
      },
    },
  },
})
