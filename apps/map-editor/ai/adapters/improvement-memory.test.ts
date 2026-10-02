import { describe, expect, it, vi } from "vitest";
import { createSupabaseImprovementMemory } from "./improvement-memory";
describe("Supabase improvement memory", () => {
  it("finds only history for the requested task", async () => {
    const eq=vi.fn().mockResolvedValue({data:[{id:"e1",task_id:"t1",strategy_id:"s1",validity:"valid",verification_passed:true,novelty:"new",difficulty_signal:"frontier",evidence:[],created_at:"2026-10-02"}],error:null});
    const limit=vi.fn().mockReturnValue({eq}); const order=vi.fn().mockReturnValue({limit}); const select=vi.fn().mockReturnValue({order});
    const from=vi.fn((table)=>table==="ai_improvement_evaluations"?{select}:{select:vi.fn().mockReturnValue({in:vi.fn().mockResolvedValue({data:[],error:null})})});
    const memory=createSupabaseImprovementMemory({from} as never);
    const history=await memory.findRelated({id:"t1",objective:"x",source:"manual",difficulty:"bounded",constraints:[]});
    expect(eq).toHaveBeenCalledWith("task_id","t1"); expect(history[0].evaluation.id).toBe("e1");
  });
});
