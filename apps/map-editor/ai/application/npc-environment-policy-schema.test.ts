import { describe, expect, it } from "vitest";
import { NPC_ENVIRONMENT_POLICY_SCHEMA, validateNpcEnvironmentPolicy } from "./npc-environment-policy-schema";

describe("NPC environment policy schema", () => {
  it("accepts a runtime-compatible policy", () => {
    const result = validateNpcEnvironmentPolicy({
      npc_movement: { cost_multiplier: 2 },
      npc_sensing: { hearing_radius: 8, smell_radius: 4, detection_modifier: 1.5 },
      npc_needs: { hunger: 2, energy: -1 },
      npc_activity_duration: { work: 8, eat: 3, sleep: 6 },
      npc_behavior: { flee: { priority_delta: 20, reason: "Explicit danger response." } },
      npc_goal_priority: { sleep: 5 },
      npc_detection_behavior: {
        hearing: { investigate: { priority_delta: 10, reason: "Investigate sound." } },
      },
      npc_investigation_recovery: {
        navigation: { action: "retry" },
        execution: { action: "clear" },
        verification: { action: "retry" },
      },
    });

    expect(result).toEqual({ ok: true, errors: [] });
  });

  it("rejects unsupported policy keys and actions", () => {
    const result = validateNpcEnvironmentPolicy({
      weather: { rain: true },
      npc_detection_behavior: { hearing: { flee: { priority_delta: 4 } } },
      npc_investigation_recovery: { navigation: { action: "alternate_route" } },
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      "Unsupported environment policy key: weather.",
      "Unsupported detection reaction: hearing.flee.",
      "npc_investigation_recovery.navigation.action must be retry or clear.",
    ]));
  });
  it("rejects malformed duration values", () => {
    const result = validateNpcEnvironmentPolicy({
      npc_activity_duration: { eat: 0, sleep: "long", dance: 4 },
    });
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      "npc_activity_duration.eat must be a finite number >= 1.",
      "npc_activity_duration.sleep must be a finite number >= 1.",
      "Unsupported npc_activity_duration goal: dance.",
    ]));
  });

  it("rejects malformed numeric and reason values", () => {
    const result = validateNpcEnvironmentPolicy({
      npc_movement: { cost_multiplier: "2" },
      npc_sensing: { hearing_radius: null },
      npc_behavior: { wander: { priority_delta: "high", reason: 7 } },
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(4);
  });

  it("exposes the same recovery actions supported by the runtime", () => {
    expect(NPC_ENVIRONMENT_POLICY_SCHEMA.recoveryActions).toEqual(["retry", "clear"]);
    expect(NPC_ENVIRONMENT_POLICY_SCHEMA.investigationFailures).toEqual([
      "navigation", "execution", "verification",
    ]);
  });
});
