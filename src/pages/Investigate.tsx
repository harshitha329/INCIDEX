import { useEffect, useState } from 'react'
import { CheckCircle2, FlaskConical, Info, Loader2, Radar, ShieldCheck, ThumbsDown, ThumbsUp, Check } from 'lucide-react'
import { Button, Card, ErrorBanner, Field, Modal, PageHeader, SeverityBadge, cx, inputCls, useToast } from '../components/ui'
import { AnalysisPanels } from '../components/Analysis'
import { ApiError, investigateIncident, submitOutcome } from '../services/incidentApi'
import { patchIncident, upsertIncident } from '../services/historyStore'
import { go } from '../hooks/useIncidents'
import { Rich } from '../utils/Rich'
import { DEMO } from '../utils/format'
import { Incident, InvestigationResult, SEVERITIES } from '../types'

const STEPS = ['Incident received', 'Analyzing incident', 'Preparing recommendation', 'Preparing investigation']
const SEV_ACTIVE = { LOW: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300', MEDIUM: 'border-amber-500/50 bg-amber-500/10 text-amber-300', HIGH: 'border-orange-500/50 bg-orange-500/10 text-orange-300', CRITICAL: 'border-red-500/60 bg-red-500/15 text-red-300' }
const msg = (e: unknown) => (e instanceof ApiError ? e.userMessage : 'Something went wrong. Please try again.')
const empty: Incident = { incident_id: '', service: '', severity: 'MEDIUM', description: '' }

export default function Investigate() {
  const toast = useToast()
  const [form, setForm] = useState<Incident>(empty), [errs, setErrs] = useState<Record<string, string>>({})
  const [phase, setPhase] = useState<'form' | 'loading' | 'result' | 'captured' | 'rejected'>('form')
  const [step, setStep] = useState(0), [result, setResult] = useState<InvestigationResult | null>(null), [err, setErr] = useState<string | null>(null)
  const [modal, setModal] = useState<'approve' | 'reject' | null>(null)
  const [outcome, setOutcome] = useState(''), [fb, setFb] = useState(''), [ferrs, setFerrs] = useState<Record<string, string>>({}), [saving, setSaving] = useState(false), [apiErr, setApiErr] = useState<string | null>(null)

  useEffect(() => { if (phase !== 'loading') return; setStep(0); const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 2200); return () => clearInterval(t) }, [phase])
  const set = (k: keyof Incident, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function run() {
    if (phase === 'loading') return
    const e: Record<string, string> = {}
    if (!form.incident_id.trim()) e.incident_id = 'Incident ID is required.'
    if (!form.service.trim()) e.service = 'Service is required.'
    if (form.description.trim().length < 10) e.description = 'Describe the incident in at least 10 characters.'
    setErrs(e); if (Object.keys(e).length) return
    const req: Incident = { incident_id: form.incident_id.trim(), service: form.service.trim(), severity: form.severity, description: form.description.trim() }
    setErr(null); setPhase('loading')
    try {
      const r = await investigateIncident(req)
      upsertIncident({ ...r, createdAt: new Date().toISOString(), status: 'investigated', learning: 'pending', result: r })
      setResult(r); setPhase('result')
    } catch (x) { setErr(msg(x)); setPhase('form') }
  }
  const reset = () => { setForm(empty); setResult(null); setOutcome(''); setFb(''); setErr(null); setApiErr(null); setFerrs({}); setPhase('form') }
  const action = result?.analysis.recommended_action

  async function approve() {
    if (saving || !result || !action) return
    const e: Record<string, string> = {}
    if (!outcome.trim()) e.outcome = 'Describe the actual outcome.'
    if (!fb.trim()) e.fb = 'Engineer feedback is required.'
    setFerrs(e); if (Object.keys(e).length) return
    setSaving(true); setApiErr(null)
    try {
      await submitOutcome({ incident_id: result.incident_id, approved: true, action, outcome: outcome.trim(), engineer_feedback: fb.trim() })
      patchIncident(result.incident_id, { status: 'approved', learning: 'captured', outcome: outcome.trim(), feedback: fb.trim() })
      setModal(null); setPhase('captured'); toast('success', 'Learning captured.')
    } catch (x) { setApiErr(msg(x)) } finally { setSaving(false) }
  }
  function reject() { if (!result) return; patchIncident(result.incident_id, { status: 'rejected', learning: 'not_captured' }); setModal(null); setPhase('rejected') }

  if (phase === 'captured' && result) return <Card className="mx-auto max-w-xl p-8 text-center animate-pop">
    <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/10"><CheckCircle2 className="h-8 w-8 text-emerald-400" /></div>
    <h1 className="text-2xl font-semibold text-white">Learning Captured</h1><p className="mt-2 text-slate-400">The incident outcome has been successfully recorded.</p>
    <p className="mt-1 font-mono text-xs text-slate-500">{result.incident_id}</p>
    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Button variant="primary" onClick={() => go(`/incident/${encodeURIComponent(result.incident_id)}`)}>View Incident</Button><Button onClick={reset}>Investigate Another Incident</Button></div></Card>

  if (phase === 'rejected' && result) return <Card className="mx-auto max-w-xl p-8 text-center animate-pop">
    <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full border border-red-500/30 bg-red-500/10"><ThumbsDown className="h-7 w-7 text-red-400" /></div>
    <h1 className="text-2xl font-semibold text-white">Recommendation Rejected</h1><p className="mt-2 text-slate-400">The recommendation for {result.incident_id} was rejected. No learning was stored.</p>
    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Button variant="primary" onClick={() => go(`/incident/${encodeURIComponent(result.incident_id)}`)}>View Incident</Button><Button onClick={reset}>Investigate Another Incident</Button></div></Card>

  if (phase === 'loading') return <Card className="mx-auto max-w-xl overflow-hidden p-8 animate-pop" >
    <div role="status" aria-live="polite"><div className="mb-6 flex items-center gap-3"><Radar className="h-6 w-6 text-sky-400" /><div><h2 className="font-semibold text-white">Investigating {form.incident_id}</h2><p className="text-sm text-slate-400">This can take up to a minute.</p></div></div>
      <div className="relative mb-6 h-1 overflow-hidden rounded bg-white/10"><div className="absolute h-full w-1/3 rounded bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-bar" /></div>
      <ol className="space-y-3">{STEPS.map((s, i) => <li key={s} className={cx('flex items-center gap-3 text-sm transition', i <= step ? 'text-slate-100' : 'text-slate-600')}>
        {i < step ? <Check className="h-4 w-4 text-emerald-400" /> : i === step ? <Loader2 className="h-4 w-4 animate-spin text-sky-400" /> : <span className="h-4 w-4 rounded-full border border-slate-700" />}{s}</li>)}</ol></div></Card>

  if (phase === 'result' && result) return <div>
    <PageHeader title="Investigation Results" action={<Button onClick={reset}>New investigation</Button>} />
    <Card className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 p-4 animate-up"><span className="font-mono text-sm font-semibold text-white">{result.incident_id}</span><span className="text-sm text-slate-300">{result.service}</span><SeverityBadge s={result.severity} />
      <p className="w-full text-sm text-slate-400">{result.description}</p><span className="rounded border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-300">Current incident</span></Card>
    <AnalysisPanels r={result} />
    <Card className="mt-6 p-5 animate-up"><div className="flex items-center gap-2 text-white"><ShieldCheck className="h-5 w-5 text-sky-400" /><h2 className="font-semibold">Engineer Review</h2></div>
      <p className="mt-1 text-sm text-slate-400">Review the AI recommendation before recording the incident outcome.</p>
      {!action && <p className="mt-3 text-sm text-amber-300">No recommended action was returned, so this incident cannot be approved.</p>}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row"><Button variant="primary" disabled={!action} onClick={() => { setApiErr(null); setModal('approve') }}><ThumbsUp className="h-4 w-4" />Approve Recommendation</Button><Button variant="danger" onClick={() => setModal('reject')}><ThumbsDown className="h-4 w-4" />Reject Recommendation</Button></div></Card>
    <Modal open={modal === 'approve'} title="Record Incident Outcome" locked={saving} onClose={() => setModal(null)}
      footer={<><Button onClick={() => setModal(null)} disabled={saving}>Cancel</Button><Button variant="primary" loading={saving} onClick={approve}>Approve & Store Learning</Button></>}>
      <div><div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">Recommended action</div><div className="max-h-36 overflow-y-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300" aria-readonly><Rich text={action} /></div></div>
      <Field label="Actual outcome" htmlFor="outcome" error={ferrs.outcome}><textarea id="outcome" rows={3} className={inputCls} value={outcome} onChange={(e) => setOutcome(e.target.value)} placeholder="What actually happened after the action was taken?" /></Field>
      <Field label="Engineer feedback" htmlFor="fb" error={ferrs.fb}><textarea id="fb" rows={3} className={inputCls} value={fb} onChange={(e) => setFb(e.target.value)} placeholder="Anything future investigations should know?" /></Field>
      {apiErr && <ErrorBanner message={apiErr} />}</Modal>
    <Modal open={modal === 'reject'} title="Reject this recommendation?" onClose={() => setModal(null)} footer={<><Button onClick={() => setModal(null)}>Keep reviewing</Button><Button variant="danger" onClick={reject}>Reject Recommendation</Button></>}>
      <p className="text-sm text-slate-300">The recommendation will be marked as rejected. No learning data will be sent or stored.</p></Modal></div>

  return <div><PageHeader title="Investigate" sub="Submit an incident for AI-assisted root-cause analysis against your organizational memory." />
    {err && <div className="mb-4"><ErrorBanner message={err} onRetry={run} /></div>}
    <Card className="p-5 sm:p-7"><form noValidate onSubmit={(e) => { e.preventDefault(); run() }} className="space-y-5">
      <div className="flex items-center justify-between"><h2 className="font-medium text-white">Incident details</h2><Button type="button" variant="ghost" onClick={() => { setForm(DEMO); setErrs({}) }}><FlaskConical className="h-4 w-4" />Load Demo Incident</Button></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Incident ID" htmlFor="iid" error={errs.incident_id}><input id="iid" className={inputCls} placeholder="INC-034" value={form.incident_id} onChange={(e) => set('incident_id', e.target.value)} /></Field>
        <Field label="Service" htmlFor="svc" error={errs.service}><input id="svc" className={inputCls} placeholder="Payment API" value={form.service} onChange={(e) => set('service', e.target.value)} /></Field></div>
      <fieldset><legend className="mb-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">Severity</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup">{SEVERITIES.map((s) => <button type="button" role="radio" aria-checked={form.severity === s} key={s} onClick={() => set('severity', s)}
          className={cx('rounded-lg border px-3 py-2 text-sm font-semibold transition', form.severity === s ? SEV_ACTIVE[s] : 'border-white/10 text-slate-400 hover:bg-white/5')}>{s}</button>)}</div></fieldset>
      <Field label="Incident description" htmlFor="desc" error={errs.description}><textarea id="desc" rows={7} className={inputCls} placeholder="Symptoms, timeline, affected users, recent changes…" value={form.description} onChange={(e) => set('description', e.target.value)} /></Field>
      <Button type="submit" variant="primary" className="w-full sm:w-auto"><Radar className="h-4 w-4" />Investigate Incident</Button></form></Card>
    <section aria-labelledby="guide-title" className="mt-6 overflow-hidden rounded-xl border border-sky-500/30 bg-gradient-to-br from-sky-500/[0.10] via-sky-500/[0.04] to-transparent animate-up">
      <div className="flex items-center gap-2 border-b border-sky-500/20 bg-sky-500/[0.08] px-5 py-3"><Info className="h-4 w-4 text-sky-300" /><h2 id="guide-title" className="text-sm font-semibold text-sky-200">What to fill in</h2><span className="ml-auto rounded-full bg-sky-500/20 px-2 py-0.5 text-[11px] font-medium text-sky-200">All fields required</span></div>
      <dl className="grid gap-4 p-5 sm:grid-cols-2">
        {[['1', 'Incident ID', 'A unique reference for this incident, e.g. INC-034. Use a new ID each time, since reusing one overwrites the earlier entry in history.'],
          ['2', 'Service', 'The affected system or component, e.g. Payment API or Auth Service.'],
          ['3', 'Severity', 'Pick the business impact: LOW (minor), MEDIUM (degraded), HIGH (major impact) or CRITICAL (outage).'],
          ['4', 'Incident Description', 'What is happening: symptoms, error messages, when it started, who is affected, and any recent changes. More detail gives a better analysis (minimum 10 characters).']].map(([n, t, d]) => <div key={n} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-500/20 text-xs font-semibold text-sky-200">{n}</span><div><dt className="text-sm font-medium text-white">{t}</dt><dd className="mt-0.5 text-sm text-slate-400">{d}</dd></div></div>)}</dl>
      <div className="border-t border-sky-500/20 bg-black/20 px-5 py-3 text-sm text-slate-300"><span className="font-medium text-sky-200">Next steps:</span> after you submit, review the AI analysis, then <span className="text-white">Approve</span> (you will enter the actual outcome and feedback) or <span className="text-white">Reject</span> the recommendation. Not sure where to start? Click <span className="text-white">Load Demo Incident</span> above.</div></section></div>
}
