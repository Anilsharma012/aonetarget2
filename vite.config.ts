import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    server: {
      host: '0.0.0.0',                 // 🔥 Replit mandatory
      port: Number(process.env.PORT) || 5000,
      strictPort: true,
      cors: true,

      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        }
      }
    },

    preview: {
      host: '0.0.0.0',
      port: Number(process.env.PORT) || 5000
    },

    define: {
      'process.env': {
        GEMINI_API_KEY: env.GEMINI_API_KEY
      }
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './')
      }
    }
  }
})
