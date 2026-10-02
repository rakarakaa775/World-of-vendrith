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
  it("loads task-related history before generating a strategy", async () => {
    const task: ImprovementTask = { id:"task-1", objective:"verify asset registry lookup", source:"verification", difficulty:"bounded", constraints:["read-only"] };
    const history: ImprovementHistory[] = [{evaluation:{id:"old-eval",taskId:task.id,strategyId:"old-strategy",validity:"valid",verificationPassed:true,novelty:"new",difficultySignal:"frontier",evidence:["ok"]},proposal:{id:"old-proposal",taskId:task.id,strategyId:"old-strategy",strategyDescription:"search registry",strategySteps:["search","verify"],rationale:"review",evaluationId:"old-eval",requiresApproval:true}}];
    const mem=makeMemory(history); let received:any;
    const engine=createImprovementEngine({
      generateTask:vi.fn(async()=>task),
      generateStrategy:vi.fn(async(_task,context)=>{received=context; return {id:"strategy-1",taskId:task.id,description:"new",steps:["verify"]};}),
      runCandidate:vi.fn(async()=>({id:"evaluation-1",taskId:task.id,strategyId:"strategy-1",validity:"valid",verificationPassed:true,novelty:"new",difficultySignal:"frontier",evidence:["ok"]})),
      memory:mem,
    });
    await engine.run();
    expect(mem.findRelated).toHaveBeenCalledWith(task);
    expect(received.relatedHistory).toEqual(history);
    expect(received.repeatedStrategyIds).toEqual([]);
  });

  it("marks repeated strategy fingerprints in context", async () => {
    const task: ImprovementTask = {id:"task-1",objective:"test",source:"manual",difficulty:"exploratory",constraints:[]};
    const repeated: ImprovementHistory = {evaluation:{id:"e2",taskId:task.id,strategyId:"s2",validity:"valid",verificationPassed:true,novelty:"known",difficultySignal:"frontier",evidence:[]},proposal:{id:"p2",taskId:task.id,strategyId:"s2",strategyDescription:"same",strategySteps:["verify"],rationale:"x",evaluationId:"e2",requiresApproval:true}};
    const first: ImprovementHistory = {...repeated,evaluation:{...repeated.evaluation,id:"e1",strategyId:"s1"},proposal:{...repeated.proposal,id:"p1",strategyId:"s1",evaluationId:"e1"}};
    const mem=makeMemory([first,repeated]); let received:any;
    const engine=createImprovementEngine({generateTask:vi.fn(async()=>task),generateStrategy:vi.fn(async(_t,c)=>{received=c;return {id:"s3",taskId:task.id,description:"new",steps:[]};}),runCandidate:vi.fn(async()=>({id:"e3",taskId:task.id,strategyId:"s3",validity:"valid",verificationPassed:true,novelty:"new",difficultySignal:"frontier",evidence:[]})),memory:mem});
    await engine.run();
    expect(received.repeatedStrategyIds).toEqual(["s2"]);
  });
});
