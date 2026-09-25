import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * `vite preview` serves dist/services/devops/index.html only for
 * /services/devops/ (with the slash). Production serves it for
 * /services/devops, so do the same here and preview the prerendered page a
 * crawler gets, instead of the SPA fallback.
 */
function previewDirectoryIndex(): Plugin {
  return {
    name: 'preview-directory-index',
    configurePreviewServer(server) {
      const outDir = join(server.config.root, server.config.build.outDir)
      server.middlewares.use((req, _res, next) => {
        const [path, query] = (req.url ?? '/').split('?')
        const isPage = path !== '/' && !path.endsWith('/') && !path.includes('..') && !/\.[a-z0-9]+$/i.test(path)
        if (isPage && existsSync(join(outDir, path, 'index.html'))) {
          req.url = `${path}/index.html${query ? `?${query}` : ''}`
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss(), previewDirectoryIndex()],
  resolve: isSsrBuild
    ? {
        // The prerender (src/entry-server.tsx) renders HTML only; it must not
        // initialise Firebase. Every import of src/lib/firebase gets a stub.
        alias: [{ find: /^(\.{1,2}\/)+lib\/firebase$/, replacement: '/src/lib/firebase.ssr.ts' }],
      }
    : undefined,
  build: isSsrBuild
    ? {}
    : {
        // dist/.vite/manifest.json: scripts/prerender.mjs reads which chunks
        // each page needs, to modulepreload them, and removes it.
        manifest: true,
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              'i18n-vendor': ['i18next', 'react-i18next'],
            },
          },
        },
      },
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
}))
