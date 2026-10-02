import type { AiMode, ApprovalState } from "../domain/types";

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

export function canMutate(state: ApprovalState): boolean {
  return state === "approved";
}

export function isHighRiskPrompt(prompt: string): boolean {
  const normalized = prompt.toLowerCase();
  return HIGH_RISK_TERMS.some((term) => normalized.includes(term));
}
