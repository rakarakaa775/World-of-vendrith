import { describe, expect, it, vi } from "vitest";
import { createSupabaseImprovementMemory } from "./improvement-memory";

describe("Supabase improvement memory", () => {
  it("writes evaluation and proposal records", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ upsert });
    const memory = createSupabaseImprovementMemory({ from } as never);
    await memory.recordEvaluation({ id:"evaluation-1",taskId:"task-1",strategyId:"strategy-1",validity:"valid",verificationPassed:true,novelty:"unknown",difficultySignal:"unknown",evidence:["ok"] });
    await memory.recordProposal({ id:"proposal-1",taskId:"task-1",strategyId:"strategy-1",strategyDescription:"reuse verification",strategySteps:["search","verify"],rationale:"review",evaluationId:"evaluation-1",requiresApproval:true });
    expect(upsert).toHaveBeenCalledTimes(2);
  });
  it("reads recent evaluations with their proposals", async () => {
    const evaluations=[{id:"evaluation-1",task_id:"task-1",strategy_id:"strategy-1",validity:"valid",verification_passed:true,novelty:"new",difficulty_signal:"frontier",evidence:["ok"],created_at:"2026-10-02T00:00:00Z"}];
    const proposals=[{id:"proposal-1",task_id:"task-1",strategy_id:"strategy-1",strategy_description:"reuse verification",strategy_steps:["search","verify"],rationale:"review",evaluation_id:"evaluation-1",requires_approval:true}];
    const limit=vi.fn().mockResolvedValue({data:evaluations,error:null});
    const order=vi.fn().mockReturnValue({limit});
    const select=vi.fn().mockReturnValue({order});
    const inFn=vi.fn().mockResolvedValue({data:proposals,error:null});
    const from=vi.fn((table)=>table==="ai_improvement_evaluations"?{select}:{select:vi.fn().mockReturnValue({in:inFn})});
    const memory=createSupabaseImprovementMemory({from} as never);
    const history=await memory.listRecent(5);
    expect(history[0].proposal?.strategyDescription).toBe("reuse verification");
    expect(history[0].evaluation.id).toBe("evaluation-1");
  });
});
