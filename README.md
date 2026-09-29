# Incident Learning & Response Agent
```
npm install
npm run dev      # reads .env (VITE_W1_WEBHOOK_URL, VITE_W2_WEBHOOK_URL)
npm run build
```
All network logic lives in `src/services/incidentApi.ts`. If the browser blocks the n8n webhooks (CORS), set `VITE_USE_PROXY=true`:
the dev server proxies `/api/w1` and `/api/w2`; in production serve those two routes from a server-side function/reverse proxy that forwards to the webhooks (keep any secrets server-side).
History is stored via `src/services/historyStore.ts` (localStorage) — replace with Supabase later without touching the UI.
