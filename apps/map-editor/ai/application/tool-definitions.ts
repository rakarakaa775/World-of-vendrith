import type { AssetRegistryPort, CodeIntelligencePort, DocumentationPort, RepositoryPort, VerificationPort } from "../ports/project-tools";
import type { MapInspectorPort } from "../ports/map-tools";
import { hasStringArgument, type ToolDefinition } from "../ports/tool-router";
import { classifyAssetEvidence } from "../policies/asset-policy";
import { buildProjectIntelligenceSnapshot } from "./project-intelligence";
import { buildProjectSchemaSummary } from "./schema-intelligence";
import { buildProjectSchemaKnowledgeGraph } from "./schema-knowledge-graph";
import { NPC_ENVIRONMENT_POLICY_SCHEMA, validateNpcEnvironmentPolicy } from "./npc-environment-policy-schema";
import { NPC_ARCHETYPE_SCHEMA, validateNpcArchetype, type NpcArchetype } from "./npc-archetype-schema";
import { NPC_ARCHETYPE_CAPABILITY_SCHEMA, npcArchetypeCapabilities, validateNpcCapabilities } from "./npc-archetype-capabilities";
import { proposeCreatorNpcPackage } from "./npc-creator-package";
import { NPC_ROLE_SCHEMA, npcRoleArchetypes, validateNpcRole, type NpcRole } from "./npc-role-schema";
import { NPC_PERSONALITY_SCHEMA, validateNpcPersonality, type NpcPersonalityRequest } from "./npc-personality-schema";
import { NPC_PERSONALITY_POLICY_SCHEMA, validateNpcPersonalityPolicy, type NpcPersonalityPolicy } from "./npc-personality-policy-schema";
import { NPC_DECISION_PROFILE_SCHEMA, validateNpcDecisionProfile } from "./npc-decision-profile-schema";
import { NPC_RELATIONSHIP_POLICY_SCHEMA, validateNpcRelationshipPolicy, type NpcRelationshipPolicy } from "./npc-relationship-policy-schema";
import { NPC_SOCIAL_INTERACTION_SCHEMA, validateNpcSocialInteraction } from "./npc-social-interaction-schema";
import { inspectMap } from "./map-inspector";
import { previewCreatorNpcPackage } from "./npc-creator-package";
import type { MapDocument } from "../../editor/map-document";
import { inspectAsset, inspectContent, inspectPlayable, inspectRegion, inspectWorld, traceContentHierarchy } from "./content-inspectors";

export interface ProjectTools {
  repository: RepositoryPort;
  codeIntelligence: CodeIntelligencePort;
  documentation: DocumentationPort;
  assetRegistry: AssetRegistryPort;
  verification: VerificationPort;
  mapInspector?: MapInspectorPort;
}

function pathArgument(name: string) { return { type: "object", properties: { [name]: { type: "string" } }, required: [name] }; }

function previewDocumentFromInspection(resolved: NonNullable<Awaited<ReturnType<NonNullable<ProjectTools["mapInspector"]>["resolveMap"]>>>): MapDocument {
  const source = resolved.document;
  return {
    version: 1,
    id: source.id,
    name: source.name,
    mapType: source.mapType,
    parentMapId: source.parentMapId,
    width: source.width,
    height: source.height,
    tileSize: source.tileSize,
    ...(source.playableSpace ? { playableSpace: source.playableSpace } : {}),
    ...(source.parentPlayableMapId !== undefined ? { parentPlayableMapId: source.parentPlayableMapId } : {}),
    layerGroups: [],
    layerTemplates: [],
    layers: source.layers.map(layer => ({
      id: layer.id,
      name: layer.name,
      kind: layer.kind,
      visible: layer.visible,
      locked: false,
      active: layer.kind === "ground",
      opacity: 1,
      cells: layer.cells.map(cell => ({ tileId: cell.tileId })),
      objects: layer.objects.map(object => ({
        ...object,
        rotation: 0,
        zIndex: 0,
        collision: layer.kind === "collision",
      })),
    })),
  };
}

export function createProjectTools(dependencies: ProjectTools): ToolDefinition[] {
  const tools: ToolDefinition[] = [
    {
      name: "schema.graph", description: "Inspect the evidence-backed Vendrith schema knowledge graph and verified relationships between project entities.", access: "read-only", parameters: { type: "object", properties: {} },
      validate: (args): args is Record<string, never> => typeof args === "object" && args !== null,
      async execute() { return buildProjectSchemaKnowledgeGraph(dependencies.repository); },
    },
    {
      name: "schema.inspect", description: "Inspect evidence-backed Map, World, Region, NPC, Dialogue, and Event schema areas found in the repository.", access: "read-only", parameters: { type: "object", properties: {} },
      validate: (args): args is Record<string, never> => typeof args === "object" && args !== null,
      async execute() { return buildProjectSchemaSummary(dependencies.repository); },
    },
    {
      name: "npc.archetype.schema", description: "Return the verified NPC archetype classification contract for Creator AI generation.", access: "read-only",
      parameters: { type: "object", properties: {} }, validate: (args): args is Record<string, never> => typeof args === "object" && args !== null,
      async execute() { return NPC_ARCHETYPE_SCHEMA; },
    },
    {
      name: "npc.archetype.validate", description: "Validate an NPC archetype. Archetype is descriptive only and does not inject runtime behavior.", access: "read-only",
      parameters: { type: "object", properties: { archetype: {} }, required: [] },
      validate: (args): args is { archetype?: unknown } => typeof args === "object" && args !== null,
      async execute(args) { return validateNpcArchetype((args as { archetype?: unknown }).archetype); },
    },
    {
      name: "npc.archetype.capabilities.schema", description: "Return the verified allow-list of runtime behavior and goal kinds by NPC archetype. Capabilities never auto-activate runtime behavior.", access: "read-only",
      parameters: { type: "object", properties: {} }, validate: (args): args is Record<string, never> => typeof args === "object" && args !== null,
      async execute() { return NPC_ARCHETYPE_CAPABILITY_SCHEMA; },
    },
    {
      name: "npc.archetype.capabilities.get", description: "Return the explicit runtime capabilities available to a supported NPC archetype.", access: "read-only",
      parameters: { type: "object", properties: { archetype: { type: "string" } }, required: ["archetype"] },
      validate: (args): args is { archetype: NpcArchetype } => typeof args === "object" && args !== null && validateNpcArchetype((args as { archetype?: unknown }).archetype).ok,
      async execute(args) { return npcArchetypeCapabilities((args as { archetype: NpcArchetype }).archetype); },
    },
    {
      name: "npc.archetype.capabilities.validate", description: "Validate explicitly requested runtime behaviors and goals against an NPC archetype.", access: "read-only",
      parameters: { type: "object", properties: { archetype: { type: "string" }, capabilities: { type: "object" } }, required: ["archetype", "capabilities"] },
      validate: (args): args is { archetype: unknown; capabilities: Record<string, unknown> } => typeof args === "object" && args !== null && typeof (args as { capabilities?: unknown }).capabilities === "object" && (args as { capabilities?: unknown }).capabilities !== null,
      async execute(args) { const value = args as { archetype: unknown; capabilities: Record<string, unknown> }; return validateNpcCapabilities(value.archetype, value.capabilities); },
    },
    {
      name: "npc.role.schema", description: "Return the verified descriptive NPC role/job contract. Roles never auto-activate runtime behavior.", access: "read-only",
      parameters: { type: "object", properties: {} }, validate: (args): args is Record<string, never> => typeof args === "object" && args !== null,
      async execute() { return NPC_ROLE_SCHEMA; },
    },
    {
      name: "npc.role.validate", description: "Validate an NPC role and its compatibility with an optional archetype.", access: "read-only",
      parameters: { type: "object", properties: { role: {}, archetype: { type: "string" } }, required: [] },
      validate: (args): args is { role?: unknown; archetype?: unknown } => typeof args === "object" && args !== null,
      async execute(args) { const value = args as { role?: unknown; archetype?: unknown }; return validateNpcRole(value.role, value.archetype); },
    },
    {
      name: "npc.role.archetypes", description: "Return the supported archetypes for a verified NPC role.", access: "read-only",
      parameters: { type: "object", properties: { role: { type: "string" } }, required: ["role"] },
      validate: (args): args is { role: NpcRole } => typeof args === "object" && args !== null && validateNpcRole((args as { role?: unknown }).role).ok,
      async execute(args) { return npcRoleArchetypes((args as { role: NpcRole }).role); },
    },
    {
      name: "npc.personality.schema", description: "Return the verified descriptive NPC personality trait contract. Traits never auto-activate runtime behavior.", access: "read-only",
      parameters: { type: "object", properties: {} }, validate: (args): args is Record<string, never> => typeof args === "object" && args !== null,
      async execute() { return NPC_PERSONALITY_SCHEMA; },
    },
    {
      name: "npc.personality.validate", description: "Validate an optional NPC personality trait configuration.", access: "read-only",
      parameters: { type: "object", properties: { personality: { type: "object" } }, required: ["personality"] },
      validate: (args): args is { personality: NpcPersonalityRequest } => typeof args === "object" && args !== null && typeof (args as { personality?: unknown }).personality === "object" && (args as { personality?: unknown }).personality !== null && !Array.isArray((args as { personality: unknown }).personality),
      async execute(args) { return validateNpcPersonality((args as { personality: unknown }).personality); },
    },
    {
      name: "npc.decision_profile.schema", description: "Return the validated NPC decision profile composition contract.", access: "read-only",
      parameters: { type: "object", properties: {} }, validate: (args): args is Record<string, never> => typeof args === "object" && args !== null,
      async execute() { return NPC_DECISION_PROFILE_SCHEMA; },
    },
    {
      name: "npc.decision_profile.validate", description: "Validate an NPC decision profile and its cross-field capability constraints.", access: "read-only",
      parameters: { type: "object", properties: { profile: { type: "object" } }, required: ["profile"] },
      validate: (args): args is { profile: unknown } => typeof args === "object" && args !== null && typeof (args as { profile?: unknown }).profile === "object" && (args as { profile?: unknown }).profile !== null && !Array.isArray((args as { profile: unknown }).profile),
      async execute(args) { return validateNpcDecisionProfile((args as { profile?: unknown }).profile); },
    },
    {
      name: "npc.personality_policy.schema", description: "Return the verified explicit NPC personality runtime policy contract.", access: "read-only",
      parameters: { type: "object", properties: {} }, validate: (args): args is Record<string, never> => typeof args === "object" && args !== null,
      async execute() { return NPC_PERSONALITY_POLICY_SCHEMA; },
    },
    {
      name: "npc.personality_policy.validate", description: "Validate an explicit NPC personality runtime policy.", access: "read-only",
      parameters: { type: "object", properties: { policy: { type: "object" } }, required: ["policy"] },
      validate: (args): args is { policy: unknown } => typeof args === "object" && args !== null && Object.prototype.hasOwnProperty.call(args, "policy"),
      async execute(args) { return validateNpcPersonalityPolicy((args as { policy?: unknown }).policy); },
    },
    {
      name: "npc.social_interaction.schema", description: "Return the explicit NPC social interaction contract. Interaction types alone never change relationships.", access: "read-only",
      parameters: { type: "object", properties: {} }, validate: (args): args is Record<string, never> => typeof args === "object" && args !== null,
      async execute() { return NPC_SOCIAL_INTERACTION_SCHEMA; },
    },
    {
      name: "npc.social_interaction.validate", description: "Validate an explicit NPC social interaction record.", access: "read-only",
      parameters: { type: "object", properties: { interaction: { type: "object" } }, required: ["interaction"] },
      validate: (args): args is { interaction: unknown } => typeof args === "object" && args !== null && Object.prototype.hasOwnProperty.call(args, "interaction"),
      async execute(args) { return validateNpcSocialInteraction((args as { interaction?: unknown }).interaction); },
    },
    {
      name: "npc.relationship_policy.schema", description: "Return the verified explicit NPC relationship runtime policy contract.", access: "read-only",
      parameters: { type: "object", properties: {} }, validate: (args): args is Record<string, never> => typeof args === "object" && args !== null,
      async execute() { return NPC_RELATIONSHIP_POLICY_SCHEMA; },
    },
    {
      name: "npc.relationship_policy.validate", description: "Validate an explicit NPC relationship runtime policy and its supported behavior/goal effects.", access: "read-only",
      parameters: { type: "object", properties: { policy: { type: "object" } }, required: ["policy"] },
      validate: (args): args is { policy: unknown } => typeof args === "object" && args !== null && Object.prototype.hasOwnProperty.call(args, "policy"),
      async execute(args) { return validateNpcRelationshipPolicy((args as { policy?: unknown }).policy); },
    },
    {
      name: "npc.environment_policy.schema", description: "Return the verified NPC environment policy contract for Creator AI generation.", access: "read-only",
      parameters: { type: "object", properties: {} }, validate: (args): args is Record<string, never> => typeof args === "object" && args !== null,
      async execute() { return NPC_ENVIRONMENT_POLICY_SCHEMA; },
    },
    {
      name: "npc.environment_policy.propose", description: "Normalize a Creator AI NPC environment policy proposal into the explicit runtime configuration shape. Validation is required before the proposal can be treated as valid.", access: "read-only",
      parameters: { type: "object", properties: { policy: { type: "object" } }, required: ["policy"] },
      validate: (args): args is { policy: Record<string, unknown> } => typeof args === "object" && args !== null && typeof (args as { policy?: unknown }).policy === "object" && (args as { policy?: unknown }).policy !== null && !Array.isArray((args as { policy: unknown }).policy),
      async execute(args) { const policy = (args as { policy: Record<string, unknown> }).policy; return { policy, validation: validateNpcEnvironmentPolicy(policy) }; },
    },
    {
      name: "npc.creator_package.propose", description: "Build a Creator AI NPC package containing identity, optional descriptive archetype/role, capabilities, and validated environment policy. This remains read-only and does not mutate the project.", access: "read-only",
      parameters: { type: "object", properties: { npc: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, archetype: { type: "string" }, role: { type: "string" }, personality: { type: "object" }, personalityPolicy: { type: "object" }, relationshipPolicy: { type: "object" }, capabilities: { type: "object" }, environmentPolicy: { type: "object" } } } }, required: ["npc"] },
      validate: (args): args is { npc: { id: string; name?: string; archetype?: string; role?: string; personality?: Record<string, unknown>; capabilities?: Record<string, unknown>; environmentPolicy: Record<string, unknown> } } => {
        if (typeof args !== "object" || args === null || typeof (args as { npc?: unknown }).npc !== "object" || (args as { npc?: unknown }).npc === null) return false;
        const npc = (args as { npc: Record<string, unknown> }).npc;
        return typeof npc.id === "string" && (npc.name === undefined || typeof npc.name === "string") &&
          (npc.archetype === undefined || typeof npc.archetype === "string") &&
          (npc.role === undefined || typeof npc.role === "string") &&
          (npc.personality === undefined || (typeof npc.personality === "object" && npc.personality !== null && !Array.isArray(npc.personality))) &&
          (npc.personalityPolicy === undefined || (typeof npc.personalityPolicy === "object" && npc.personalityPolicy !== null && !Array.isArray(npc.personalityPolicy))) &&
          (npc.relationshipPolicy === undefined || (typeof npc.relationshipPolicy === "object" && npc.relationshipPolicy !== null && !Array.isArray(npc.relationshipPolicy))) &&
          (npc.capabilities === undefined || (typeof npc.capabilities === "object" && npc.capabilities !== null && !Array.isArray(npc.capabilities))) &&
          typeof npc.environmentPolicy === "object" && npc.environmentPolicy !== null && !Array.isArray(npc.environmentPolicy);
      },
      async execute(args) { return proposeCreatorNpcPackage((args as { npc: { id: string; name?: string; archetype?: NpcArchetype; role?: NpcRole; personality?: NpcPersonalityRequest; personalityPolicy?: NpcPersonalityPolicy; relationshipPolicy?: NpcRelationshipPolicy; capabilities?: Record<string, unknown>; environmentPolicy: Record<string, unknown> } }).npc); },
    },
    {
      name: "npc.environment_policy.validate", description: "Validate a proposed NPC environment policy against the verified runtime contract.", access: "read-only",
      parameters: { type: "object", properties: { policy: { type: "object" } }, required: ["policy"] },
      validate: (args): args is { policy: Record<string, unknown> } => typeof args === "object" && args !== null && typeof (args as { policy?: unknown }).policy === "object" && (args as { policy?: unknown }).policy !== null && !Array.isArray((args as { policy: unknown }).policy),
      async execute(args) { return validateNpcEnvironmentPolicy((args as { policy: Record<string, unknown> }).policy); },
    },
    {
      name: "project.inspect", description: "Inspect the evidence-backed Vendrith project intelligence snapshot.", access: "read-only", parameters: pathArgument("query"), validate: hasStringArgument("query"),
      async execute(args) { return buildProjectIntelligenceSnapshot((args as { query: string }).query, { repository: dependencies.repository, code: dependencies.codeIntelligence, documentation: dependencies.documentation, assetRegistry: dependencies.assetRegistry }); },
    },
  ];

  if (dependencies.mapInspector) {
    const mapInspector = dependencies.mapInspector;
    const contentDeps = { map: mapInspector, assetRegistry: dependencies.assetRegistry };
    tools.push({
      name: "npc.creator_package.preview",
      description: "Preview a validated Creator NPC package on an authoritative map without persisting changes. Returns runtime diagnostics after a bounded number of simulation ticks.",
      access: "read-only",
      parameters: { type: "object", properties: { mapId: { type: "string" }, npc: { type: "object" }, ticks: { type: "number", minimum: 0, maximum: 20 } }, required: ["mapId", "npc"] },
      validate: (args): args is { mapId: string; npc: Record<string, unknown>; ticks?: number } => {
        if (typeof args !== "object" || args === null) return false;
        const input = args as { mapId?: unknown; npc?: unknown; ticks?: unknown };
        return typeof input.mapId === "string" && typeof input.npc === "object" && input.npc !== null && !Array.isArray(input.npc) &&
          (input.ticks === undefined || (typeof input.ticks === "number" && Number.isInteger(input.ticks) && input.ticks >= 0 && input.ticks <= 20));
      },
      async execute(args) {
        const input = args as { mapId: string; npc: Record<string, unknown>; ticks?: number };
        const resolved = await mapInspector.resolveMap(input.mapId);
        if (!resolved) return { found: false, mapId: input.mapId, error: "Map was not found." };
        const result = await previewCreatorNpcPackage(previewDocumentFromInspection(resolved), input.npc as never, input.ticks ?? 1);
        return { found: true, mapId: input.mapId, ...result };
      },
    });
    tools.push(
      {
        name: "world.inspect", description: "Inspect an authoritative World map, hierarchy, content, terrain, linked Regions, and asset provenance. Read-only.", access: "read-only", parameters: pathArgument("worldId"), validate: hasStringArgument("worldId"),
        async execute(args) { return inspectWorld((args as { worldId: string }).worldId, contentDeps); },
      },
      {
        name: "region.inspect", description: "Inspect an authoritative Region map, hierarchy, content, linked Playable maps, and asset provenance. Read-only.", access: "read-only", parameters: pathArgument("regionId"), validate: hasStringArgument("regionId"),
        async execute(args) { return inspectRegion((args as { regionId: string }).regionId, contentDeps); },
      },
      {
        name: "playable.inspect", description: "Inspect an authoritative Playable map, its parent Region or Playable exterior, interior links, content, and asset provenance. Read-only.", access: "read-only", parameters: pathArgument("playableId"), validate: hasStringArgument("playableId"),
        async execute(args) { return inspectPlayable((args as { playableId: string }).playableId, contentDeps); },
      },
      {
        name: "content.inspect", description: "Unified read-only content inspector. Inspect World, Region, Playable, or Asset by ID; with type auto, authoritative map identity is checked before falling back to verified asset evidence.", access: "read-only", parameters: { type: "object", properties: { id: { type: "string" }, type: { type: "string", enum: ["auto", "world", "region", "playable", "asset"] } }, required: ["id", "type"] },
        validate: (args): args is { id: string; type: "auto" | "world" | "region" | "playable" | "asset" } => typeof args === "object" && args !== null && typeof (args as { id?: unknown }).id === "string" && ["auto", "world", "region", "playable", "asset"].includes((args as { type?: unknown }).type as string),
        async execute(args) { const input = args as { id: string; type: "auto" | "world" | "region" | "playable" | "asset" }; return inspectContent(input.id, input.type, contentDeps); },
      },
      {
        name: "asset.inspect", description: "Inspect verified asset registry evidence, placement domain, license state, attribution, and usage permissions. Read-only.", access: "read-only", parameters: pathArgument("assetId"), validate: hasStringArgument("assetId"),
        async execute(args) { return inspectAsset((args as { assetId: string }).assetId, contentDeps); },
      },
      {
        name: "content.trace", description: "Trace an authoritative map hierarchy across World, Region, Playable, and Interior links with a bounded depth. Read-only and evidence-backed.", access: "read-only", parameters: { ...pathArgument("mapId"), properties: { mapId: { type: "string" }, maxDepth: { type: "number", minimum: 0, maximum: 3 } } },
        validate: (args): args is { mapId: string; maxDepth?: number } => typeof args === "object" && args !== null && typeof (args as { mapId?: unknown }).mapId === "string" && ((args as { maxDepth?: unknown }).maxDepth === undefined || (typeof (args as { maxDepth: unknown }).maxDepth === "number" && Number.isInteger((args as { maxDepth: number }).maxDepth) && (args as { maxDepth: number }).maxDepth >= 0 && (args as { maxDepth: number }).maxDepth <= 3)),
        async execute(args) { const input = args as { mapId: string; maxDepth?: number }; return traceContentHierarchy(input.mapId, contentDeps, input.maxDepth ?? 3); },
      },
      {
        name: "map.inspect", description: "Inspect an authoritative Vendrith map by ID: identity, hierarchy, layers, terrain, objects, linked maps, and verified asset provenance. Read-only.", access: "read-only", parameters: pathArgument("mapId"), validate: hasStringArgument("mapId"),
        async execute(args) { return inspectMap((args as { mapId: string }).mapId, contentDeps); },
      },
    );
  }

  tools.push(
    { name: "repository.read_file", description: "Read a text file from the project repository.", access: "read-only", parameters: pathArgument("path"), validate: hasStringArgument("path"), async execute(args) { const input = args as { path: string }; return { path: input.path, content: await dependencies.repository.readFile(input.path) }; } },
    { name: "repository.search", description: "Search project repository text for a query.", access: "read-only", parameters: pathArgument("query"), validate: hasStringArgument("query"), async execute(args) { return dependencies.repository.search((args as { query: string }).query); } },
    { name: "codegraph.dependencies", description: "Find direct structural dependencies imported by a repository file.", access: "read-only", parameters: pathArgument("path"), validate: hasStringArgument("path"), async execute(args) { return dependencies.codeIntelligence.findDependencies((args as { path: string }).path); } },
    { name: "codegraph.dependents", description: "Find repository files that depend on a target file.", access: "read-only", parameters: pathArgument("path"), validate: hasStringArgument("path"), async execute(args) { return dependencies.codeIntelligence.findDependents((args as { path: string }).path); } },
    { name: "documentation.search", description: "Search authoritative Vendrith project documentation and rules.", access: "read-only", parameters: pathArgument("query"), validate: hasStringArgument("query"), async execute(args) { return dependencies.documentation.search((args as { query: string }).query); } },
    {
      name: "asset_registry.search", description: "Search asset provenance, license, attribution, and approval evidence.", access: "read-only", parameters: pathArgument("query"), validate: hasStringArgument("query"),
      async execute(args) { const evidence = await dependencies.assetRegistry.search((args as { query: string }).query); return evidence.map((item) => { const intelligence = classifyAssetEvidence(item); return { ...intelligence.evidence, usageDomain: intelligence.usageDomain, licenseState: intelligence.licenseState, reason: intelligence.reason }; }); },
    },
    {
      name: "verification.run", description: "Run bounded project verification for requested scopes.", access: "read-only", parameters: { type: "object", properties: { scope: { type: "array", items: { type: "string" }, maxItems: 20 } }, required: ["scope"] },
      validate: (args): args is { scope: string[] } => typeof args === "object" && args !== null && Array.isArray((args as { scope?: unknown }).scope) && (args as { scope: unknown[] }).scope.length <= 20 && (args as { scope: unknown[] }).scope.every((item) => typeof item === "string"),
      async execute(args) { return dependencies.verification.verify((args as { scope: string[] }).scope); },
    },
  );
  return tools;
}

export const createRepositoryTools = createProjectTools;
