import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// Dev-only proxy used when VITE_USE_PROXY=true. In production, expose /api/w1 and /api/w2
// from a serverless function / reverse proxy that forwards to the n8n webhooks.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const t = (u?: string) => { try { const x = new URL(u || ''); return { target: x.origin, changeOrigin: true, rewrite: () => x.pathname } } catch { return undefined } }
  const proxy: Record<string, any> = {}
  const a = t(env.VITE_W1_WEBHOOK_URL), b = t(env.VITE_W2_WEBHOOK_URL)
  if (a) proxy['/api/w1'] = a
  if (b) proxy['/api/w2'] = b
  return { plugins: [react()], server: { proxy } }
})
