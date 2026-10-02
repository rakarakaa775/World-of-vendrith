export type AiMode = "explain" | "plan" | "execute" | "high-risk";

export type EvidenceKind =
  | "verified-fact"
  | "project-rule"
  | "inference"
  | "proposal"
  | "unresolved-conflict";

export interface Evidence {
  id: string;
  kind: EvidenceKind;
  source: string;
  fact: string;
  timestamp?: string;
  version?: string;
  confidence: "high" | "medium" | "low";
}

export interface AiRequest {
  id: string;
  mode: AiMode;
  prompt: string;
  projectPath?: string;
}

export interface AiPlanStep {
  id: string;
  description: string;
  readOnly: boolean;
  requiresApproval: boolean;
}

export interface AiPlan {
  requestId: string;
  summary: string;
  steps: AiPlanStep[];
  evidence: Evidence[];
}

export interface VerificationResult {
  ok: boolean;
  checks: Array<{
    name: string;
    ok: boolean;
    detail?: string;
  }>;
}

export type ApprovalState = "not-required" | "pending" | "approved" | "rejected" | "completed";
