import type { AIAnalysis, ApprovalPayload, ApprovalResponse, HistoricalEvidence, Incident, InvestigationResult, Severity } from '../types'
type Rec = Record<string, unknown>
const TIMEOUT_MS = 45000
export class ApiError extends Error { constructor(public userMessage: string, public kind: 'config' | 'network' | 'timeout' | 'http' | 'empty' | 'json' | 'shape') { super(userMessage) } }

const env = import.meta.env
export const endpointsConfigured = () => ({
  w1: env.VITE_USE_PROXY === 'true' || !!env.VITE_W1_WEBHOOK_URL,
  w2: env.VITE_USE_PROXY === 'true' || !!env.VITE_W2_WEBHOOK_URL,
  proxy: env.VITE_USE_PROXY === 'true',
})
function endpoint(k: 'w1' | 'w2'): string {
  if (env.VITE_USE_PROXY === 'true') return `/api/${k}` // same-origin server-side proxy; UI unchanged
  const u = k === 'w1' ? env.VITE_W1_WEBHOOK_URL : env.VITE_W2_WEBHOOK_URL
  if (!u) throw new ApiError('This action is not configured yet. Set the webhook environment variables and restart the app.', 'config')
  return u
}
async function post(k: 'w1' | 'w2', body: unknown): Promise<unknown> {
  const url = endpoint(k), ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), TIMEOUT_MS)
  let res: Response
  try { res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal }) }
  catch (e) {
    if ((e as Error).name === 'AbortError') throw new ApiError('The request timed out. Please try again.', 'timeout')
    throw new ApiError('Unable to reach the incident service. Check your connection, or enable the server-side proxy if this is a CORS issue.', 'network')
  } finally { clearTimeout(timer) }
  const text = await res.text()
  if (!res.ok) throw new ApiError(`The service responded with an error (HTTP ${res.status}). Please retry shortly.`, 'http')
  if (!text.trim()) throw new ApiError('The service returned an empty response.', 'empty')
  try { return JSON.parse(text) } catch { throw new ApiError('The service returned a response that could not be read.', 'json') }
}
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v : typeof v === 'number' ? String(v) : undefined)
const obj = (v: unknown): Rec | undefined => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Rec) : undefined)
const first = (d: unknown) => obj(Array.isArray(d) ? d[0] : d)

function toEvidence(v: unknown): HistoricalEvidence[] {
  if (!v) return []
  const out: HistoricalEvidence[] = []
  for (const x of Array.isArray(v) ? v : [v]) {
    if (typeof x === 'string') { if (x.trim()) out.push({ summary: x }); continue }
    const o = obj(x); if (!o) continue
    const e: HistoricalEvidence = {
      incident_id: str(o.incident_id ?? o.incidentId ?? o.id), service: str(o.service),
      summary: str(o.summary ?? o.description ?? o.content ?? o.text ?? o.incident),
      resolution: str(o.resolution ?? o.outcome ?? o.action), memory_id: str(o.memory_id ?? o.memoryId ?? o.memory_identifier),
    }
    if (Object.values(e).some(Boolean)) out.push(e)
  }
  return out
}
export async function investigateIncident(req: Incident): Promise<InvestigationResult> {
  const o = first(await post('w1', req))
  if (!o) throw new ApiError('The investigation response was not in the expected format.', 'shape')
  const a = obj(o.ai_analysis) ?? o
  const analysis: AIAnalysis = {
    likely_root_cause: str(a.likely_root_cause ?? a.root_cause), recommended_action: str(a.recommended_action ?? a.recommendation),
    reasoning: str(a.reasoning), confidence: typeof a.confidence === 'number' ? a.confidence : str(a.confidence),
  }
  if (!Object.values(analysis).some((v) => v !== undefined)) throw new ApiError('The investigation completed but returned no analysis. Please retry.', 'shape')
  const sev = str(o.severity)?.toUpperCase() as Severity | undefined
  return {
    incident_id: str(o.incident_id) ?? req.incident_id, service: str(o.service) ?? req.service,
    severity: sev && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(sev) ? sev : req.severity, description: str(o.description) ?? req.description,
    analysis, evidence: toEvidence(o.memory_used ?? o.historical_evidence ?? o.evidence ?? a.memory_used),
  }
}
export async function submitOutcome(p: ApprovalPayload): Promise<ApprovalResponse> {
  const o = first(await post('w2', p))
  if (o && (o.success === false || o.error || str(o.status)?.toLowerCase() === 'error'))
    throw new ApiError(str(o.message) ?? 'The service could not record the outcome.', 'http')
  return { success: true, message: str(o?.message) }
}
