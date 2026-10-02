import { describe, expect, it, vi } from "vitest";
import { createImprovementEngine } from "./improvement-engine";
import type { ImprovementTask } from "../domain/improvement";

const memory = () => ({
  recordEvaluation: vi.fn(async () => undefined),
  recordProposal: vi.fn(async () => undefined),
  listRecent: vi.fn(async () => []),
});

describe("improvement engine", () => {
  it("loads prior history before generating a strategy", async () => {
    const task: ImprovementTask = {id:"task-1",objective:"verify asset registry lookup",source:"verification",difficulty:"bounded",constraints:["read-only"]};
    const history = [{evaluation:{id:"old-eval",taskId:"old-task",strategyId:"old-strategy",validity:"valid",verificationPassed:true,novelty:"new",difficultySignal:"frontier",evidence:["ok"]}}];
    const mem = memory(); mem.listRecent.mockResolvedValue(history);
    let received:any;
    const engine=createImprovementEngine({
      generateTask:vi.fn(async()=>task),
      generateStrategy:vi.fn(async(_task,h)=>{received=h; return {id:"strategy-1",taskId:task.id,description:"new",steps:["verify"]};}),
      runCandidate:vi.fn(async()=>({id:"evaluation-1",taskId:task.id,strategyId:"strategy-1",validity:"valid",verificationPassed:true,novelty:"new",difficultySignal:"frontier",evidence:["ok"]})),
      memory:mem,
    });
    await engine.run();
    expect(received).toEqual(history);
  });
  it("rejects a strategy that targets a different task", async () => {
    const task: ImprovementTask = {id:"task-1",objective:"test",source:"manual",difficulty:"exploratory",constraints:[]};
    const engine=createImprovementEngine({generateTask:vi.fn(async()=>task),generateStrategy:vi.fn(async()=>({id:"strategy-1",taskId:"other-task",description:"wrong",steps:[]})),runCandidate:vi.fn(),memory:memory()});
    await expect(engine.run()).rejects.toThrow("Strategy candidate does not belong to generated task");
  });
});
