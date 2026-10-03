import { describe, expect, it } from "vitest";
import { buildNpcRuntimeSpawnContract, NPC_RUNTIME_SPAWN_CONTRACT_VERSION, validateNpcRuntimeSpawnContract } from "./npc-runtime-spawn-contract";

describe("NPC runtime spawn contract", () => {
  const profile = { archetype: "civilian" as const, role: "citizen" as const, capabilities: { behaviors: ["idle" as const], goals: ["work" as const] } };
  const environmentPolicy = { npc_movement: { cost_multiplier: 1.5 } };

  it("persists decision profile and environment policy together", () => {
    const contract = buildNpcRuntimeSpawnContract(profile, environmentPolicy);
    expect(contract).toEqual({ version: NPC_RUNTIME_SPAWN_CONTRACT_VERSION, decisionProfile: profile, environmentPolicy });
    expect(validateNpcRuntimeSpawnContract(contract).ok).toBe(true);
  });

  it("rejects malformed or unsupported runtime payloads", () => {
    expect(validateNpcRuntimeSpawnContract({ version: 1, decisionProfile: { archetype: "civilian", capabilities: { behaviors: ["not-real"] } }, environmentPolicy: {} }).ok).toBe(false);
    expect(validateNpcRuntimeSpawnContract({ version: 2, decisionProfile: profile, environmentPolicy }).ok).toBe(false);
  });
});
