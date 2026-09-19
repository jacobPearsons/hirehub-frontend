import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function apiOrigin(apiUrl: string): string {
  return apiUrl.replace(/\/+$/, '').replace(/\/api$/, '')
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:4000/api'
  const origin = apiOrigin(apiUrl)

  return {
    plugins: [
      react(),
      {
        name: 'html-env-transform',
        transformIndexHtml(html: string) {
          return html.replaceAll('%VITE_API_ORIGIN%', origin)
        },
      },
    ],
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router-dom')) return 'vendor'
            if (id.includes('node_modules/framer-motion')) return 'motion'
            if (id.includes('node_modules/lucide-react')) return 'icons'
            if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform/resolvers') || id.includes('node_modules/zod')) return 'forms'
          },
        },
      },
    },
    server: {
      proxy: {
        '/api': {
          target: origin,
          changeOrigin: true,
        },
      },
    },
  }
})