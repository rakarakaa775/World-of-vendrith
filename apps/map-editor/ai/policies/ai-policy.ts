import type { AiMode, ApprovalState } from "../domain/types";
import type { ApprovalRecord, ApprovalTransitionResult } from "../domain/approval";
import { transitionApproval } from "../domain/approval";

const HIGH_RISK_TERMS = [
  "secret",
  "password",
  "token",
  "production database",
  "delete history",
  "license override",
  "deploy production",
];

export function classifyApproval(mode: AiMode, prompt: string): ApprovalState {
  const normalized = prompt.toLowerCase();
  const highRisk = HIGH_RISK_TERMS.some((term) => normalized.includes(term));
  if (mode === "high-risk" || highRisk) return "pending";
  if (mode === "execute") return "pending";
  return "not-required";
}

export function isHighRiskPrompt(prompt: string): boolean {
  const normalized = prompt.toLowerCase();
  return HIGH_RISK_TERMS.some((term) => normalized.includes(term));
}

export function canMutate(state: ApprovalState): boolean {
  return state === "approved";
}

export function approveExecution(record: ApprovalRecord): ApprovalTransitionResult {
  if (record.state !== "pending") {
    return { ok: false, record, error: "Only pending requests can be approved" };
  }
  return transitionApproval(record, "approve");
}

export function rejectExecution(record: ApprovalRecord): ApprovalTransitionResult {
  return transitionApproval(record, "reject");
}

export function completeExecution(record: ApprovalRecord): ApprovalTransitionResult {
  return transitionApproval(record, "complete");
}
