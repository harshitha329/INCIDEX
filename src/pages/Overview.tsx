import { Activity, ArrowRight, Brain, CheckCircle2, Lightbulb, Radar } from 'lucide-react'
import { Button, Card, cx } from '../components/ui'
import { go, useIncidents } from '../hooks/useIncidents'
import { SEVERITIES } from '../types'
export default function Overview() {
  const l = useIncidents()
  const m = [['Incidents Investigated', l.length, Radar, 'text-sky-400'], ['Recommendations Generated', l.filter((i) => i.result?.analysis.recommended_action).length, Lightbulb, 'text-cyan-300'], ['Approved Incidents', l.filter((i) => i.status === 'approved').length, CheckCircle2, 'text-emerald-400'], ['Learnings Captured', l.filter((i) => i.learning === 'captured').length, Brain, 'text-violet-400']] as const
  const sevBar = { LOW: 'bg-emerald-400', MEDIUM: 'bg-amber-400', HIGH: 'bg-orange-400', CRITICAL: 'bg-red-400' }
  const svcs = Object.entries(l.reduce<Record<string, number>>((a, i) => ({ ...a, [i.service]: (a[i.service] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const ev = l.reduce((n, i) => n + (i.result?.evidence.length ?? 0), 0), max = Math.max(1, ...SEVERITIES.map((s) => l.filter((i) => i.severity === s).length))
  return <div className="space-y-6">
    <Card className="relative overflow-hidden p-7 sm:p-10 animate-up"><div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="relative"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs text-sky-300"><Activity className="h-3.5 w-3.5" />Incident Learning & Response Agent</div>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">AI-powered incident investigation for faster, smarter production response.</h1>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Button variant="primary" onClick={() => go('/investigate')}>Investigate New Incident<ArrowRight className="h-4 w-4" /></Button><Button onClick={() => go('/history')}>View Incident History</Button></div></div></Card>
    <div><div className="mb-3 text-xs text-slate-500">Figures are derived from incidents stored in this browser.</div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{m.map(([t, v, Icon, c]) => <Card key={t} className="p-5 animate-up"><Icon className={cx('h-5 w-5', c)} /><div className="mt-4 text-3xl font-semibold text-white">{v}</div><div className="mt-1 text-sm text-slate-400">{t}</div></Card>)}</div></div>
    <Card className="p-6 animate-up"><h2 className="font-semibold text-white">Incident Intelligence</h2><p className="mb-5 text-sm text-slate-400">How your investigated incidents break down.</p>
      {!l.length ? <p className="text-sm text-slate-500">Investigate an incident to see severity, service, and evidence insights here.</p> : <div className="grid gap-8 lg:grid-cols-3">
        <div><h3 className="mb-3 text-xs uppercase tracking-wider text-slate-500">By severity</h3><div className="space-y-2.5">{SEVERITIES.map((s) => { const n = l.filter((i) => i.severity === s).length; return <div key={s} className="flex items-center gap-3 text-xs"><span className="w-16 text-slate-400">{s}</span><div className="h-2 flex-1 rounded bg-white/5"><div className={cx('h-full rounded transition-all duration-700', sevBar[s])} style={{ width: `${(n / max) * 100}%` }} /></div><span className="w-4 text-right text-slate-300">{n}</span></div> })}</div></div>
        <div><h3 className="mb-3 text-xs uppercase tracking-wider text-slate-500">Top services</h3><ul className="space-y-2 text-sm">{svcs.map(([s, n]) => <li key={s} className="flex justify-between text-slate-300"><span>{s}</span><span className="text-slate-500">{n}</span></li>)}</ul></div>
        <div><h3 className="mb-3 text-xs uppercase tracking-wider text-slate-500">Historical evidence</h3><div className="text-3xl font-semibold text-violet-300">{ev}</div><p className="mt-1 text-sm text-slate-400">memory items surfaced across investigations</p></div></div>}</Card></div>
}
