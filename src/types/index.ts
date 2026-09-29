export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export const SEVERITIES: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
export interface Incident { incident_id: string; service: string; severity: Severity; description: string }
export interface AIAnalysis { likely_root_cause?: string; recommended_action?: string; reasoning?: string; confidence?: string | number }
export interface HistoricalEvidence { incident_id?: string; service?: string; summary?: string; resolution?: string; memory_id?: string }
export interface InvestigationResult extends Incident { analysis: AIAnalysis; evidence: HistoricalEvidence[] }
export interface ApprovalPayload { incident_id: string; approved: boolean; action: string; outcome: string; engineer_feedback: string }
export interface ApprovalResponse { success: boolean; message?: string }
export type IncidentStatus = 'investigated' | 'approved' | 'rejected'
export type LearningStatus = 'captured' | 'not_captured' | 'pending'
export interface StoredIncident extends Incident {
  createdAt: string; updatedAt?: string; status: IncidentStatus; learning: LearningStatus
  result?: InvestigationResult; outcome?: string; feedback?: string
}
