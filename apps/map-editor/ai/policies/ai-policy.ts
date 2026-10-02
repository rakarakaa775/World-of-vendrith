import type { ApprovalState } from "../domain/types";
import type { ApprovalRecord, ApprovalTransitionResult } from "../domain/approval";
import { transitionApproval } from "../domain/approval";

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

export function canMutate(state: ApprovalState): boolean {
  return state === "approved";
}
