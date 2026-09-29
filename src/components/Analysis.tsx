import { useState } from 'react'
import { Brain, Check, Copy, Gauge, History, Lightbulb, Target } from 'lucide-react'
import type { HistoricalEvidence, InvestigationResult } from '../types'
import { Badge, Card, Button, useToast, cx } from './ui'
import { Rich } from '../utils/Rich'
import { confidencePct } from '../utils/format'

const Section = ({ icon, title, tone = 'text-sky-400', children, right, className }: { icon: React.ReactNode; title: string; tone?: string; children: React.ReactNode; right?: React.ReactNode; className?: string }) => (
  <Card className={cx('p-5 animate-up', className)}><div className="mb-3 flex items-center justify-between gap-2"><h3 className={cx('flex items-center gap-2 text-xs font-semibold uppercase tracking-wider', tone)}>{icon}{title}</h3>{right}</div>{children}</Card>)
const Missing = () => <p className="text-sm italic text-slate-500">Not provided by the investigation service.</p>

export function EvidenceCard({ e }: { e: HistoricalEvidence }) {
  return <div className="relative rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.07] to-transparent p-4">
    <div className="mb-2 flex flex-wrap items-center gap-2"><Badge tone="violet"><History className="h-3 w-3" />Past incident</Badge>{e.incident_id && <span className="font-mono text-xs text-slate-300">{e.incident_id}</span>}{e.service && <Badge>{e.service}</Badge>}</div>
    {e.summary && <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300"><Rich text={e.summary} /></p>}
    {e.resolution && <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] p-3"><div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Resolution</div><p className="whitespace-pre-wrap text-sm text-slate-300"><Rich text={e.resolution} /></p></div>}
    {e.memory_id && <p className="mt-3 font-mono text-[11px] text-slate-500">memory: {e.memory_id}</p>}</div>
}
export function AnalysisPanels({ r }: { r: InvestigationResult }) {
  const [copied, setCopied] = useState(false); const toast = useToast(); const a = r.analysis; const pct = confidencePct(a.confidence)
  const copy = async () => { try { await navigator.clipboard.writeText(a.recommended_action ?? ''); setCopied(true); setTimeout(() => setCopied(false), 1800); toast('success', 'Recommended action copied.') } catch { toast('error', 'Copy failed. Select the text manually.') } }
  return <div className="space-y-4">
    <div className="grid gap-4 lg:grid-cols-3">
      <Section icon={<Target className="h-4 w-4" />} title="Likely root cause" className="lg:col-span-2" tone="text-amber-400">{a.likely_root_cause ? <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-white"><Rich text={a.likely_root_cause} /></p> : <Missing />}</Section>
      <Section icon={<Gauge className="h-4 w-4" />} title="Confidence" tone="text-cyan-400">{a.confidence === undefined ? <Missing /> : <>
        <div className="text-3xl font-semibold text-white">{pct !== null ? `${Math.round(pct)}%` : String(a.confidence)}</div>
        {pct !== null && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-300 transition-all duration-700" style={{ width: `${pct}%` }} /></div>}</>}</Section></div>
    <Section icon={<Lightbulb className="h-4 w-4" />} title="Recommended action" tone="text-emerald-400" className="border-emerald-500/20"
      right={a.recommended_action && <Button variant="ghost" className="!px-2.5 !py-1.5 text-xs" onClick={copy}>{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? 'Copied' : 'Copy'}</Button>}>
      {a.recommended_action ? <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-white"><Rich text={a.recommended_action} /></p> : <Missing />}</Section>
    <Section icon={<Brain className="h-4 w-4" />} title="Reasoning" tone="text-slate-400">{a.reasoning ? <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300"><Rich text={a.reasoning} /></p> : <Missing />}</Section>
    <Section icon={<History className="h-4 w-4" />} title="Historical evidence" tone="text-violet-400" right={<Badge tone="violet">{r.evidence.length} from organizational memory</Badge>}>
      {r.evidence.length ? <div className="grid gap-3 md:grid-cols-2">{r.evidence.map((e, i) => <EvidenceCard key={i} e={e} />)}</div> : <p className="text-sm text-slate-400">No similar historical incidents were returned for this investigation.</p>}</Section></div>
}
