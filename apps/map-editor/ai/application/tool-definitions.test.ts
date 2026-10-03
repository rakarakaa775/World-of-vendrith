import { describe, expect, it } from "vitest";
import { createProjectTools } from "./tool-definitions";
import type { ProjectTools } from "./tool-definitions";

function dependencies(): ProjectTools {
  return {
    repository: {
      async readFile(path) { return `content:${path}`; },
      async search(query) { return [{ path: "src/a.ts", excerpt: query }]; },
    },
    codeIntelligence: {
      async findDependencies(path) { return [`dep:${path}`]; },
      async findDependents(path) { return [`dependent:${path}`]; },
    },
    documentation: {
      async search(query) { return [{ id: "doc-1", kind: "project-rule", source: "AGENTS.md", fact: query, confidence: "high" }]; },
    },
    assetRegistry: {
      async search(query) { return [{ id: "asset-1", kind: "verified-fact", source: "asset_license_registry", fact: JSON.stringify({ name: "LPC Grass", category: "terrain", licenseVerificationStatus: "verified", licenseUsageStatus: "allowed", commercialUseAllowed: true }), confidence: "high" }]; },
    },
    verification: {
      async verify(scope) { return { ok: true, checks: scope.map(name => ({ name, ok: true })) }; },
    },
  };
}

describe("project tool definitions", () => {
  it("exposes structural, documentation, asset, repository and verification tools", () => {
    const names = createProjectTools(dependencies()).map(tool => tool.name);
    expect(names).toEqual([
      "schema.graph",
      "schema.inspect",
      "npc.archetype.schema",
      "npc.archetype.validate",
      "npc.archetype.capabilities.schema",
      "npc.archetype.capabilities.get",
      "npc.archetype.capabilities.validate",
      "npc.role.schema",
      "npc.role.validate",
      "npc.role.archetypes",
      "npc.personality.schema",
      "npc.personality.validate",
      "npc.decision_profile.schema",
      "npc.decision_profile.validate",
      "npc.personality_policy.schema",
      "npc.personality_policy.validate",
      "npc.relationship_policy.schema",
      "npc.relationship_policy.validate",
      "npc.environment_policy.schema",
      "npc.environment_policy.propose",
      "npc.creator_package.propose",
      "npc.environment_policy.validate",
      "project.inspect",
      "repository.read_file",
      "repository.search",
      "codegraph.dependencies",
      "codegraph.dependents",
      "documentation.search",
      "asset_registry.search",
      "verification.run",
    ]);
  });

  it("proposes and validates structured NPC environment configuration", async () => {
    const tools = createProjectTools(dependencies());
    const propose = tools.find(tool => tool.name === "npc.environment_policy.propose");
    const validate = tools.find(tool => tool.name === "npc.environment_policy.validate");
    expect(propose).toBeDefined();
    expect(validate).toBeDefined();

    const capabilitySchema = tools.find(tool => tool.name === "npc.archetype.capabilities.schema");
    const capabilityGet = tools.find(tool => tool.name === "npc.archetype.capabilities.get");
    const capabilityValidate = tools.find(tool => tool.name === "npc.archetype.capabilities.validate");
    expect(capabilitySchema).toBeDefined();
    expect(capabilityGet).toBeDefined();
    expect(capabilityValidate).toBeDefined();
    await expect(capabilityGet!.execute({ archetype: "military" }, { mode: "explain", requestId: "req-1" })).resolves.toMatchObject({ behaviors: expect.arrayContaining(["investigate", "flee"]) });
    await expect(capabilityValidate!.execute({ archetype: "enemy", capabilities: { goals: ["eat"] } }, { mode: "explain", requestId: "req-1" })).resolves.toEqual({ ok: false, errors: ["NPC archetype enemy does not allow goal: eat."] });

    const archetypeSchema = tools.find(tool => tool.name === "npc.archetype.schema");
    const archetypeValidate = tools.find(tool => tool.name === "npc.archetype.validate");
    expect(archetypeSchema).toBeDefined();
    expect(archetypeValidate).toBeDefined();
    await expect(archetypeSchema!.execute({}, { mode: "explain", requestId: "req-1" })).resolves.toMatchObject({
      field: "archetype",
      values: expect.arrayContaining(["production", "military", "special", "custom"]),
    });
    await expect(archetypeValidate!.execute({ archetype: "military" }, { mode: "explain", requestId: "req-1" })).resolves.toEqual({ ok: true, errors: [] });
    await expect(archetypeValidate!.execute({ archetype: "commander" }, { mode: "explain", requestId: "req-1" })).resolves.toEqual({ ok: false, errors: ["Unsupported NPC archetype: commander."] });

    const policy = {
      npc_sensing: { hearing_radius: 8 },
      npc_detection_behavior: { hearing: { investigate: { priority_delta: 20, reason: "Investigate sound." } } },
      npc_investigation_recovery: { navigation: { action: "retry" } },
    };
    const proposed = await propose!.execute({ policy }, { mode: "explain", requestId: "req-1" });
    expect(proposed).toEqual({ policy, validation: { ok: true, errors: [] } });

    const packageTool = tools.find(tool => tool.name === "npc.creator_package.propose");
    expect(packageTool).toBeDefined();
    await expect(packageTool!.execute({
      npc: { id: "npc-1", name: "Scout", archetype: "military", role: "scout", capabilities: { behaviors: ["investigate"], goals: ["go-to-location"] }, environmentPolicy: policy },
    }, { mode: "explain", requestId: "req-1" })).resolves.toEqual({
      npc: { id: "npc-1", name: "Scout", archetype: "military", role: "scout", capabilities: { behaviors: ["investigate"], goals: ["go-to-location"] }, environmentPolicy: policy },
      validation: { ok: true, errors: [] },
    });

    await expect(packageTool!.execute({
      npc: { id: "npc-2", archetype: "commander", environmentPolicy: policy },
    }, { mode: "explain", requestId: "req-1" })).resolves.toMatchObject({
      validation: { ok: false, errors: ["Unsupported NPC archetype: commander."] },
    });
    await expect(packageTool!.execute({
      npc: { id: "npc-3", archetype: "enemy", capabilities: { goals: ["eat"] }, environmentPolicy: policy },
    }, { mode: "explain", requestId: "req-1" })).resolves.toMatchObject({
      validation: { ok: false, errors: ["NPC archetype enemy does not allow goal: eat."] },
    });

    const invalid = await validate!.execute({
      policy: { npc_investigation_recovery: { navigation: { action: "alternate_route" } } },
    }, { mode: "explain", requestId: "req-1" });
    expect(invalid.ok).toBe(false);
  });

  it("executes CodeGraph and asset registry tools through their ports", async () => {
    const tools = createProjectTools(dependencies());
    const graph = tools.find(tool => tool.name === "codegraph.dependencies");
    const assets = tools.find(tool => tool.name === "asset_registry.search");
    expect(graph).toBeDefined();
    expect(assets).toBeDefined();

    const graphResult = await graph!.execute({ path: "src/editor.ts" }, {
      mode: "explain", requestId: "req-1",
    });
    const assetResult = await assets!.execute({ query: "LPC terrain" }, {
      mode: "explain", requestId: "req-1",
    });

    expect(graphResult).toEqual(["dep:src/editor.ts"]);
    expect(assetResult).toMatchObject([{ source: "asset_license_registry", usageDomain: "world", licenseState: "clear" }]);
  });
});


describe("map.inspect tool registration", () => {
  it("is exposed only when an authoritative map inspector is configured", async () => {
    const { createProjectTools } = await import("./tool-definitions");
    const repository = { readFile: async () => null, search: async () => [] };
    const base = {
      repository,
      codeIntelligence: { findDependencies: async () => [], findDependents: async () => [] },
      documentation: { search: async () => [] },
      assetRegistry: { search: async () => [] },
      verification: { verify: async () => ({ ok: true, checks: [] }) },
    } as any;
    expect(createProjectTools(base).some((tool) => tool.name === "map.inspect")).toBe(false);
    expect(createProjectTools({ ...base, mapInspector: { resolveMap: async () => null } }).some((tool) => tool.name === "map.inspect")).toBe(true);
  });
});
