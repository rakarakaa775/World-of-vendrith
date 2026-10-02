import { describe, expect, it } from "vitest";
import { createApprovalRecord, transitionApproval } from "../domain/approval";
import { approveExecution, completeExecution, rejectExecution } from "./ai-policy";

describe("approval state machine", () => {
  it("requires approval for execute and high-risk requests", () => {
    expect(createApprovalRecord({ id: "e", mode: "execute", prompt: "change map" }).state).toBe("pending");
    expect(createApprovalRecord({ id: "h", mode: "high-risk", prompt: "deploy production" }).state).toBe("pending");
  });

  it("allows pending -> approved -> completed", () => {
    const pending = createApprovalRecord({ id: "e", mode: "execute", prompt: "change map" });
    const approved = approveExecution(pending);
    expect(approved.record.state).toBe("approved");
    const completed = completeExecution(approved.record);
    expect(completed.record.state).toBe("completed");
  });

  it("rejects invalid transitions and rejected execution", () => {
    const pending = createApprovalRecord({ id: "e", mode: "execute", prompt: "change map" });
    const rejected = rejectExecution(pending);
    expect(rejected.record.state).toBe("rejected");
    expect(approveExecution(rejected.record).ok).toBe(false);
    expect(transitionApproval(rejected.record, "complete").ok).toBe(false);
  });

  it("does not allow not-required requests to become approved", () => {
    const record = createApprovalRecord({ id: "x", mode: "explain", prompt: "inspect" });
    expect(transitionApproval(record, "approve").ok).toBe(false);
  });
});
