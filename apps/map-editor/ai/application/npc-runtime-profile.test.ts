import { describe, expect, it } from "vitest";
import { creatorNpcDecisionProfile, proposeCreatorNpcPackage } from "./npc-creator-package";
import { decisionProfileFromMetadata, validatedNpcDecisionProfile } from "./npc-runtime-profile";

describe("NPC runtime profile propagation", () => {
  it("builds the runtime profile from a validated Creator NPC package", () => {
    const npc = {
      id: "npc-1",
      archetype: "civilian" as const,
      role: "citizen" as const,
      capabilities: { behaviors: ["idle" as const], goals: ["work" as const] },
      personality: { traits: ["calm" as const] },
      personalityPolicy: { rules: [{ trait: "calm" as const, behaviors: { idle: 10 } }] },
      environmentPolicy: {},
    };
    expect(proposeCreatorNpcPackage(npc).validation.ok).toBe(true);
    expect(creatorNpcDecisionProfile(npc)).toMatchObject({ archetype: "civilian", role: "citizen" });
  });

  it("accepts only validated decision profiles from seed metadata", () => {
    const profile = { archetype: "civilian", capabilities: { behaviors: ["idle"] } };
    expect(decisionProfileFromMetadata({ decisionProfile: profile })).toEqual(profile);
    expect(decisionProfileFromMetadata({ decisionProfile: { archetype: "civilian", capabilities: { behaviors: ["not-real"] } } })).toBeUndefined();
    expect(validatedNpcDecisionProfile(undefined)).toBeUndefined();
  });
});
