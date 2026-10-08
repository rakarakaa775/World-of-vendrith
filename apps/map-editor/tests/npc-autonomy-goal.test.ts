import { describe, expect, it } from "vitest";
import { selectNpcGoal } from "../ai/domain/npc-autonomy";

describe("NPC goal prioritization", () => {
  it("prefers urgency while retaining importance as a tie-breaker", () => {
    const goal = selectNpcGoal([
      { kind: "work", urgency: 60, importance: 100, reason: "shift is due" },
      { kind: "recover-energy", urgency: 90, importance: 20, reason: "energy is low" },
    ]);

    expect(goal.kind).toBe("recover-energy");
    expect(goal.score).toBe(69);
  });

  it("clamps invalid scores instead of allowing them to dominate", () => {
    const goal = selectNpcGoal([
      { kind: "explore", urgency: Number.NaN, importance: 1000, reason: "bad input" },
      { kind: "socialize", urgency: 50, importance: 50, reason: "meet friend" },
    ]);

    expect(goal.kind).toBe("socialize");
    expect(goal.score).toBe(50);
  });

  it("falls back to idle when no candidates exist", () => {
    expect(selectNpcGoal([])).toEqual({
      kind: "idle",
      score: 0,
      reason: "No autonomous goal candidates were available.",
    });
  });
});
