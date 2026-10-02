import type {
  AssetRegistryPort,
  CodeIntelligencePort,
  DocumentationPort,
  RepositoryPort,
  VerificationPort,
} from "../ports/project-tools";
import type { MapInspectorPort } from "../ports/map-tools";
import {
  hasStringArgument,
  type ToolDefinition,
} from "../ports/tool-router";
import { classifyAssetEvidence } from "../policies/asset-policy";
import { buildProjectIntelligenceSnapshot } from "./project-intelligence";
import { buildProjectSchemaSummary } from "./schema-intelligence";
import { buildProjectSchemaKnowledgeGraph } from "./schema-knowledge-graph";
import { inspectMap } from "./map-inspector";
import { inspectAsset, inspectRegion, inspectWorld } from "./content-inspectors";

export interface ProjectTools {
  repository: RepositoryPort;
  codeIntelligence: CodeIntelligencePort;
  documentation: DocumentationPort;
  assetRegistry: AssetRegistryPort;
  verification: VerificationPort;
  mapInspector?: MapInspectorPort;
}

function pathArgument(name: string) {
  return {
    type: "object",
    properties: { [name]: { type: "string" } },
    required: [name],
  };
}

export function createProjectTools(dependencies: ProjectTools): ToolDefinition[] {
  const tools: ToolDefinition[] = [
    {
      name: "schema.graph",
      description: "Inspect the evidence-backed Vendrith schema knowledge graph and verified relationships between project entities.",
      access: "read-only",
      parameters: { type: "object", properties: {} },
      validate: (args): args is Record<string, never> => typeof args === "object" && args !== null,
      async execute() { return buildProjectSchemaKnowledgeGraph(dependencies.repository); },
    },
    {
      name: "schema.inspect",
      description: "Inspect evidence-backed Map, World, Region, NPC, Dialogue, and Event schema areas found in the repository.",
      access: "read-only",
      parameters: { type: "object", properties: {} },
      validate: (args): args is Record<string, never> => typeof args === "object" && args !== null,
      async execute() { return buildProjectSchemaSummary(dependencies.repository); },
    },
    {
      name: "project.inspect",
      description: "Inspect the evidence-backed Vendrith project intelligence snapshot: repository manifest, structure, dependencies, documentation, and asset intelligence.",
      access: "read-only",
      parameters: pathArgument("query"),
      validate: hasStringArgument("query"),
      async execute(args) { return buildProjectIntelligenceSnapshot((args as { query: string }).query, { repository: dependencies.repository, code: dependencies.codeIntelligence, documentation: dependencies.documentation, assetRegistry: dependencies.assetRegistry }); },
    },
  ];

  if (dependencies.mapInspector) {
    const contentDeps = { map: dependencies.mapInspector, assetRegistry: dependencies.assetRegistry };
    tools.push(
      {
        name: "world.inspect",
        description: "Inspect an authoritative World map, its hierarchy, content, terrain, linked Regions, and asset provenance. Read-only.",
        access: "read-only",
        parameters: pathArgument("worldId"),
        validate: hasStringArgument("worldId"),
        async execute(args) { return inspectWorld((args as { worldId: string }).worldId, contentDeps); },
      },
      {
        name: "region.inspect",
        description: "Inspect an authoritative Region map, its hierarchy, content, linked Playable maps, and asset provenance. Read-only.",
        access: "read-only",
        parameters: pathArgument("regionId"),
        validate: hasStringArgument("regionId"),
        async execute(args) { return inspectRegion((args as { regionId: string }).regionId, contentDeps); },
      },
      {
        name: "asset.inspect",
        description: "Inspect verified asset registry evidence, placement domain, license state, attribution, and usage permissions. Read-only.",
        access: "read-only",
        parameters: pathArgument("assetId"),
        validate: hasStringArgument("assetId"),
        async execute(args) { return inspectAsset((args as { assetId: string }).assetId, contentDeps); },
      },
      {
      name: "map.inspect",
      description: "Inspect an authoritative Vendrith map by ID: identity, hierarchy, layers, terrain, objects, linked maps, and verified asset provenance. Read-only and evidence-backed.",
      access: "read-only",
      parameters: pathArgument("mapId"),
      validate: hasStringArgument("mapId"),
      async execute(args) {
        return inspectMap((args as { mapId: string }).mapId, {
          map: dependencies.mapInspector!,
          assetRegistry: dependencies.assetRegistry,
        });
      },
      },
    );
  }

  tools.push(
    {
      name: "repository.read_file",
      description: "Read a text file from the project repository.",
      access: "read-only",
      parameters: pathArgument("path"),
      validate: hasStringArgument("path"),
      async execute(args) { const input = args as { path: string }; return { path: input.path, content: await dependencies.repository.readFile(input.path) }; },
    },
    {
      name: "repository.search",
      description: "Search project repository text for a query.",
      access: "read-only",
      parameters: pathArgument("query"),
      validate: hasStringArgument("query"),
      async execute(args) { return dependencies.repository.search((args as { query: string }).query); },
    },
    {
      name: "codegraph.dependencies",
      description: "Find direct structural dependencies imported by a repository file.",
      access: "read-only",
      parameters: pathArgument("path"),
      validate: hasStringArgument("path"),
      async execute(args) { return dependencies.codeIntelligence.findDependencies((args as { path: string }).path); },
    },
    {
      name: "codegraph.dependents",
      description: "Find repository files that depend on a target file.",
      access: "read-only",
      parameters: pathArgument("path"),
      validate: hasStringArgument("path"),
      async execute(args) { return dependencies.codeIntelligence.findDependents((args as { path: string }).path); },
    },
    {
      name: "documentation.search",
      description: "Search authoritative Vendrith project documentation and rules.",
      access: "read-only",
      parameters: pathArgument("query"),
      validate: hasStringArgument("query"),
      async execute(args) { return dependencies.documentation.search((args as { query: string }).query); },
    },
    {
      name: "asset_registry.search",
      description: "Search asset provenance, license, attribution, and approval evidence.",
      access: "read-only",
      parameters: pathArgument("query"),
      validate: hasStringArgument("query"),
      async execute(args) {
        const evidence = await dependencies.assetRegistry.search((args as { query: string }).query);
        return evidence.map((item) => { const intelligence = classifyAssetEvidence(item); return { ...intelligence.evidence, usageDomain: intelligence.usageDomain, licenseState: intelligence.licenseState, reason: intelligence.reason }; });
      },
    },
    {
      name: "verification.run",
      description: "Run bounded project verification for requested scopes.",
      access: "read-only",
      parameters: { type: "object", properties: { scope: { type: "array", items: { type: "string" }, maxItems: 20 } }, required: ["scope"] },
      validate: (args): args is { scope: string[] } => typeof args === "object" && args !== null && Array.isArray((args as { scope?: unknown }).scope) && (args as { scope: unknown[] }).scope.length <= 20 && (args as { scope: unknown[] }).scope.every((item) => typeof item === "string"),
      async execute(args) { return dependencies.verification.verify((args as { scope: string[] }).scope); },
    },
  );

  return tools;
}

export const createRepositoryTools = createProjectTools;
