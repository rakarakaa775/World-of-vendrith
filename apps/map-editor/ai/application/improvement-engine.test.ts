import { describe, expect, it, vi } from "vitest";
import { createImprovementEngine } from "./improvement-engine";
import type { ImprovementHistory, ImprovementTask } from "../domain/improvement";

const makeMemory = (history: ImprovementHistory[] = []) => ({
  recordEvaluation: vi.fn(async () => undefined),
  recordProposal: vi.fn(async () => undefined),
  listRecent: vi.fn(async () => history),
  findRelated: vi.fn(async () => history),
});

describe("improvement engine", () => {
  it("rejects an exact strategy duplicate before running the candidate", async () => {
    const task: ImprovementTask = {id:"task-1",objective:"test",source:"manual",difficulty:"bounded",constraints:[]};
    const history: ImprovementHistory[] = [{
      evaluation:{id:"e1",taskId:task.id,strategyId:"old",validity:"valid",verificationPassed:true,novelty:"known",difficultySignal:"frontier",evidence:[]},
      proposal:{id:"p1",taskId:task.id,strategyId:"old",strategyDescription:"Search registry",strategySteps:["Search","Verify"],rationale:"x",evaluationId:"e1",requiresApproval:true}
    }];
    const runCandidate=vi.fn();
    const engine=createImprovementEngine({
      generateTask:vi.fn(async()=>task),
      generateStrategy:vi.fn(async()=>({id:"new",taskId:task.id,description:" search registry ",steps:["search","verify"]})),
      runCandidate,
      memory:makeMemory(history),
    });
    await expect(engine.run()).rejects.toThrow("duplicates a previously evaluated strategy");
    expect(runCandidate).not.toHaveBeenCalled();
  });

  it("allows a materially different strategy", async () => {
    const task: ImprovementTask = {id:"task-1",objective:"test",source:"manual",difficulty:"bounded",constraints:[]};
    const history: ImprovementHistory[] = [{
      evaluation:{id:"e1",taskId:task.id,strategyId:"old",validity:"valid",verificationPassed:true,novelty:"known",difficultySignal:"frontier",evidence:[]},
      proposal:{id:"p1",taskId:task.id,strategyId:"old",strategyDescription:"Search registry",strategySteps:["Search","Verify"],rationale:"x",evaluationId:"e1",requiresApproval:true}
    }];
    const runCandidate=vi.fn(async()=>({id:"new",taskId:task.id,strategyId:"new",validity:"valid",verificationPassed:true,novelty:"new",difficultySignal:"frontier",evidence:[]}));
    const engine=createImprovementEngine({
      generateTask:vi.fn(async()=>task),
      generateStrategy:vi.fn(async()=>({id:"new",taskId:task.id,description:"Compare graph dependencies",steps:["Analyze","Verify"]})),
      runCandidate,memory:makeMemory(history),
    });
    await engine.run();
    expect(runCandidate).toHaveBeenCalledOnce();
  });
});
