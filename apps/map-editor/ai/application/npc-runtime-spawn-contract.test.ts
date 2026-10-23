import { describe, expect, it } from "vitest";
import { buildNpcRuntimeSpawnContract, NPC_RUNTIME_SPAWN_CONTRACT_VERSION, validateNpcRuntimeSpawnContract } from "./npc-runtime-spawn-contract";

describe("NPC runtime spawn contract", () => {
  const profile = { archetype: "civilian" as const, role: "citizen" as const, capabilities: { behaviors: ["idle" as const], goals: ["work" as const] } };
  const environmentPolicy = { npc_movement: { cost_multiplier: 1.5 } };

  it("persists decision, environment, and explicit physical traversal capabilities together", () => {
    const traversalCapabilities = { canSwim: true, hasWaterTransport: false };
    const contract = buildNpcRuntimeSpawnContract(profile, environmentPolicy, traversalCapabilities);
    expect(contract).toEqual({ version: NPC_RUNTIME_SPAWN_CONTRACT_VERSION, decisionProfile: profile, environmentPolicy, traversalCapabilities });
    expect(validateNpcRuntimeSpawnContract(contract).ok).toBe(true);
  });

  it("keeps older contracts land-only and rejects malformed traversal capabilities", () => {
    const legacyContract = buildNpcRuntimeSpawnContract(profile, environmentPolicy);
    expect(validateNpcRuntimeSpawnContract(legacyContract).ok).toBe(true);
    expect(legacyContract.traversalCapabilities).toBeUndefined();
    expect(validateNpcRuntimeSpawnContract({ ...legacyContract, traversalCapabilities: { canSwim: "yes", hasWaterTransport: false } }).ok).toBe(false);
    expect(validateNpcRuntimeSpawnContract({ ...legacyContract, traversalCapabilities: { canSwim: true } }).ok).toBe(false);
    expect(validateNpcRuntimeSpawnContract({ ...legacyContract, traversalCapabilities: { canSwim: true, hasWaterTransport: false, canFly: true } }).ok).toBe(false);
    expect(validateNpcRuntimeSpawnContract({ ...legacyContract, debugOverride: true }).ok).toBe(false);
  });

  it("rejects malformed or unsupported runtime payloads", () => {
    expect(validateNpcRuntimeSpawnContract({ version: 1, decisionProfile: { archetype: "civilian", capabilities: { behaviors: ["not-real"] } }, environmentPolicy: {} }).ok).toBe(false);
    expect(validateNpcRuntimeSpawnContract({ version: 2, decisionProfile: profile, environmentPolicy }).ok).toBe(false);
  });
});
