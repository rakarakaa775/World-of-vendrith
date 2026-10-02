import type { AiRequest, ApprovalState } from "../domain/types";

export type ApprovalAction = "approve" | "reject" | "complete";

export interface ApprovalRecord {
  requestId: string;
  state: ApprovalState;
  updatedAt?: string;
}

export interface ApprovalTransitionResult {
  ok: boolean;
  record: ApprovalRecord;
  error?: string;
}

const allowed: Record<ApprovalState, ApprovalState[]> = {
  "not-required": ["completed"],
  pending: ["approved", "rejected"],
  approved: ["completed", "rejected"],
  rejected: [],
  completed: [],
};

export function createApprovalRecord(request: AiRequest): ApprovalRecord {
  return {
    requestId: request.id,
    state: request.mode === "execute" || request.mode === "high-risk" ? "pending" : "not-required",
  };
}

export function transitionApproval(
  record: ApprovalRecord,
  action: ApprovalAction,
): ApprovalTransitionResult {
  const next: ApprovalState =
    action === "approve" ? "approved" :
    action === "reject" ? "rejected" :
    "completed";

  if (!allowed[record.state].includes(next)) {
    return {
      ok: false,
      record,
      error: `Invalid approval transition: ${record.state} -> ${next}`,
    };
  }

  return {
    ok: true,
    record: { ...record, state: next },
  };
}
