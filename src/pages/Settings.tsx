import { useState } from 'react'
import { Modal, Button, Card, PageHeader, Badge, useToast } from '../components/ui'
import { endpointsConfigured } from '../services/incidentApi'
import { clearHistory } from '../services/historyStore'
export default function SettingsPage() {
  const c = endpointsConfigured(), toast = useToast(), [ask, setAsk] = useState(false)
  const row = (l: string, k: string, ok: boolean) => <div className="flex items-center justify-between gap-3 py-3 text-sm"><div><div className="text-slate-200">{l}</div><div className="font-mono text-xs text-slate-500">{k}</div></div><Badge tone={ok ? 'green' : 'amber'}>{ok ? 'Configured' : 'Missing'}</Badge></div>
  return <div><PageHeader title="Settings" sub="Connection and local data settings." />
    <div className="grid gap-4 lg:grid-cols-2"><Card className="p-5"><h2 className="font-medium text-white">Backend connections</h2><div className="mt-2 divide-y divide-white/[0.06]">{row('Investigation (W1)', 'VITE_W1_WEBHOOK_URL', c.w1)}{row('Outcome recording (W2)', 'VITE_W2_WEBHOOK_URL', c.w2)}</div>
      <p className="mt-3 text-xs text-slate-500">{c.proxy ? 'Requests are routed through the same-origin proxy (/api/w1, /api/w2).' : 'Requests go directly to the configured webhooks. If the browser blocks them (CORS), set VITE_USE_PROXY=true and serve /api/w1 and /api/w2 from a server-side proxy.'} Endpoint URLs are never shown here.</p></Card>
      <Card className="p-5"><h2 className="font-medium text-white">Local data</h2><p className="mt-2 text-sm text-slate-400">Incident history and learnings are stored in this browser only.</p><Button variant="danger" className="mt-4" onClick={() => setAsk(true)}>Clear local history</Button></Card></div>
    <Modal open={ask} title="Clear local history?" onClose={() => setAsk(false)} footer={<><Button onClick={() => setAsk(false)}>Cancel</Button><Button variant="danger" onClick={() => { clearHistory(); setAsk(false); toast('success', 'Local history cleared.') }}>Clear history</Button></>}><p className="text-sm text-slate-300">This removes incidents stored in this browser. Data already sent to the backend is not affected.</p></Modal></div>
}
