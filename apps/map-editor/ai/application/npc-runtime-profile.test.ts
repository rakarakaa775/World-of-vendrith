import { describe, expect, it } from "vitest";
import { creatorNpcDecisionProfile, creatorNpcRuntimeMetadata, proposeCreatorNpcPackage } from "./npc-creator-package";
import { decisionProfileFromMetadata, validatedNpcDecisionProfile } from "./npc-runtime-profile";
import { createMap } from "../../editor/map-document";
import { previewCreatorNpcPackage } from "./npc-creator-package";
import { validatedNpcRuntimeSpawnContract } from "./npc-runtime-spawn-contract";

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

  it("serializes a validated Creator runtime contract into metadata and rehydrates it after JSON persistence", () => {
    const npc = {
      id: "npc-water-traveler",
      archetype: "civilian" as const,
      role: "citizen" as const,
      capabilities: { behaviors: ["idle" as const], goals: ["work" as const] },
      environmentPolicy: { npc_movement: { cost_multiplier: 1.25 } },
      traversalCapabilities: { canSwim: true, hasWaterTransport: false },
    };
    const metadata = creatorNpcRuntimeMetadata(npc, { source: "npc-creator", keepMe: true });
    expect(metadata).toMatchObject({ source: "npc-creator", keepMe: true });
    const persistedAndReadBack = JSON.parse(JSON.stringify(metadata)) as Record<string, unknown>;
    const contract = validatedNpcRuntimeSpawnContract(persistedAndReadBack.npcRuntimeContract);
    expect(contract?.traversalCapabilities).toEqual({ canSwim: true, hasWaterTransport: false });
    expect(contract?.environmentPolicy).toEqual({ npc_movement: { cost_multiplier: 1.25 } });
  });

  it("refuses to build a metadata write payload for invalid Creator input or malformed existing metadata", () => {
    expect(creatorNpcRuntimeMetadata({ id: "bad", environmentPolicy: { unexpected: true } } as never)).toBeUndefined();
    expect(creatorNpcRuntimeMetadata({ id: "ok", environmentPolicy: {} }, null)).toBeUndefined();
  });

  it("previews a validated Creator package without persistence", async () => {
    const map = createMap("playable", null, "exterior", null, 16, 16);
    const result = await previewCreatorNpcPackage(map, {
      id: "npc-preview",
      name: "Preview Citizen",
      archetype: "civilian",
      capabilities: { behaviors: ["idle", "follow-player"] },
      environmentPolicy: {
        npc_sensing: { hearing_radius: 3, smell_radius: 2, detection_modifier: 1.5 },
        npc_movement: { cost_multiplier: 2.5 },
      },
    }, 1);
    expect(result.validation.ok).toBe(true);
    expect(result.ticks).toBe(1);
    expect(result.diagnostics?.validation.ok).toBe(true);
    expect(result.diagnostics?.decisionProfile?.archetype).toBe("civilian");
    expect(result.diagnostics?.environmentPolicy?.npc_sensing).toEqual({ hearing_radius: 3, smell_radius: 2, detection_modifier: 1.5 });
    expect(result.diagnostics?.sensing).toEqual({ hearingRadius: 3, smellRadius: 2, detectionModifier: 1.5 });
  });

  it("does not simulate an invalid Creator package", async () => {
    const map = createMap("playable", null, "exterior", null, 16, 16);
    const result = await previewCreatorNpcPackage(map, {
      id: "npc-invalid",
      archetype: "civilian",
      capabilities: { behaviors: ["not-real"] },
      environmentPolicy: {},
    } as never, 3);
    expect(result.validation.ok).toBe(false);
    expect(result.ticks).toBe(0);
    expect(result.diagnostics).toBeUndefined();
  });

  it("accepts only validated decision profiles from seed metadata", () => {
    const profile = { archetype: "civilian", capabilities: { behaviors: ["idle"] } };
    expect(decisionProfileFromMetadata({ decisionProfile: profile })).toEqual(profile);
    expect(decisionProfileFromMetadata({ decisionProfile: { archetype: "civilian", capabilities: { behaviors: ["not-real"] } } })).toBeUndefined();
    expect(validatedNpcDecisionProfile(undefined)).toBeUndefined();
  });
});
