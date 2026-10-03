import type { Evidence } from "../domain/types";
import type { RepositoryPort } from "../ports/project-tools";
import { buildProjectSchemaSummary, type SchemaArea } from "./schema-intelligence";

export type SchemaNodeKind =
  | SchemaArea
  | "playable-exterior"
  | "playable-interior"
  | "map-layer"
  | "terrain-cell"
  | "map-object"
  | "asset"
  | "npc-environment-policy"
  | "npc-archetype"
  | "npc-role"
  | "npc-personality";

export interface SchemaNode {
  id: string;
  kind: SchemaNodeKind;
  label: string;
  evidence: Evidence[];
}

export interface SchemaEdge {
  from: string;
  relation: string;
  to: string;
  evidence: Evidence[];
}

export interface ProjectSchemaKnowledgeGraph {
  generatedAt: string;
  nodes: SchemaNode[];
  edges: SchemaEdge[];
}

const MAP_HIERARCHY_EVIDENCE = [
  {
    source: "repository:apps/map-editor/editor/map-manager.ts",
    fact: "A world map can create a region child; a region can create a playable child.",
  },
  {
    source: "repository:apps/map-editor/editor/map-document.ts",
    fact: "MapDocument supports mapType world, region, or playable and stores parentMapId.",
  },
];

const PLAYABLE_EVIDENCE = [
  {
    source: "repository:apps/map-editor/editor/playable-hierarchy.ts",
    fact: "A playable exterior can own playable interior maps through parentPlayableMapId.",
  },
];

const MAP_CONTENT_EVIDENCE = [
  {
    source: "repository:apps/map-editor/editor/map-document.ts",
    fact: "MapDocument contains MapLayer[]; each MapLayer has a kind, cells, and objects.",
  },
  {
    source: "repository:apps/map-editor/editor/map-document.ts",
    fact: "MapLayerKind is ground, objects, or collision; MapObject carries kind, category, assetId, and optional child/interior map links.",
  },
];

const TERRAIN_EVIDENCE = [
  {
    source: "repository:apps/map-editor/editor/terrain-engine.ts",
    fact: "Ground tile IDs resolve to terrain keys including grass, sand, dirt, water, brackish, deepwater2, and deepwater.",
  },
  {
    source: "repository:apps/map-editor/editor/terrain-engine.ts",
    fact: "Water depth is represented by water, brackish, deepwater2, and deepwater bands.",
  },
];

const NPC_ARCHETYPE_EVIDENCE = [
  {
    source: "repository:apps/map-editor/ai/application/npc-archetype-capabilities.ts",
    fact: "Archetype capability contracts expose only runtime behavior and goal kinds already implemented by the engine; capability requests are validated and never auto-activated.",
  },
  {
    source: "repository:apps/map-editor/ai/application/npc-archetype-schema.ts",
    fact: "NPC archetypes are descriptive classifications: production, military, civilian, merchant, worker, companion, enemy, animal, special, and custom.",
  },
  {
    source: "repository:apps/map-editor/ai/application/npc-archetype-schema.ts",
    fact: "An NPC archetype does not inject behavior, goals, needs, combat, or permissions; runtime behavior remains explicitly configured.",
  },
];

const NPC_PERSONALITY_EVIDENCE = [
  {
    source: "repository:apps/map-editor/ai/application/npc-personality-schema.ts",
    fact: "NPC personality traits are descriptive configuration and are never auto-activated into runtime behavior, goals, needs, combat, permissions, or capabilities.",
  },
];

const NPC_ROLE_EVIDENCE = [
  {
    source: "repository:apps/map-editor/ai/application/npc-role-schema.ts",
    fact: "NPC roles are descriptive job/classification labels with explicit compatibility to supported archetypes; roles do not auto-activate runtime behavior.",
  },
];

const NPC_ENVIRONMENT_POLICY_EVIDENCE = [
  {
    source: "repository:apps/map-editor/ai/application/npc-navigation.ts",
    fact: "NPC movement supports explicit environment movement cost rules and deterministic path replanning.",
  },
  {
    source: "repository:apps/map-editor/ai/application/runtime-world-adapter.ts",
    fact: "NPC sensing supports explicit hearing radius, smell radius, and detection modifier rules.",
  },
  {
    source: "repository:apps/map-editor/ai/application/environment-npc-effects.ts",
    fact: "NPC behavior, needs, goals, detection reactions, and investigation recovery can be changed only by explicit environment condition rules.",
  },
  {
    source: "repository:apps/map-editor/ai/application/environment-npc-effects.ts",
    fact: "Investigation recovery explicitly supports retry or clear for navigation, execution, and verification failures.",
  },
];

const ASSET_EVIDENCE = [
  {
    source: "repository:apps/map-editor/editor/map-asset-loader.ts",
    fact: "Physical map assets are loaded from approved asset_registry rows only when their license registry is verified and usage/commercial/modification/redistribution permissions are allowed.",
  },
  {
    source: "repository:apps/map-editor/editor/asset-resolver.ts",
    fact: "World assets are resolved from the verified world_asset_manifest_v1 or approved asset registry.",
  },
];

function evidence(idPrefix: string, facts: Array<{ source: string; fact: string }>): Evidence[] {
  return facts.map((item, index) => ({
    id: `${idPrefix}-${index}`,
    kind: "verified-fact",
    source: item.source,
    fact: item.fact,
    confidence: "high",
  }));
}

function schemaEvidence(summary: Awaited<ReturnType<typeof buildProjectSchemaSummary>>, area: SchemaArea): Evidence[] {
  return summary.areas.find((item) => item.area === area)?.evidence ?? [];
}

export async function buildProjectSchemaKnowledgeGraph(
  repository: RepositoryPort,
): Promise<ProjectSchemaKnowledgeGraph> {
  const summary = await buildProjectSchemaSummary(repository);
  const areas: SchemaArea[] = ["map", "world", "region", "npc", "dialogue", "event"];

  const nodes: SchemaNode[] = areas.map((area) => ({
    id: area,
    kind: area,
    label: area[0].toUpperCase() + area.slice(1),
    evidence: schemaEvidence(summary, area),
  }));

  nodes.push(
    {
      id: "playable-exterior",
      kind: "playable-exterior",
      label: "Playable Exterior",
      evidence: evidence("schema-graph-playable-exterior", PLAYABLE_EVIDENCE),
    },
    {
      id: "playable-interior",
      kind: "playable-interior",
      label: "Playable Interior",
      evidence: evidence("schema-graph-playable-interior", PLAYABLE_EVIDENCE),
    },
    {
      id: "map-layer",
      kind: "map-layer",
      label: "Map Layer",
      evidence: evidence("schema-graph-map-layer", MAP_CONTENT_EVIDENCE),
    },
    {
      id: "terrain-cell",
      kind: "terrain-cell",
      label: "Terrain Cell",
      evidence: evidence("schema-graph-terrain-cell", TERRAIN_EVIDENCE),
    },
    {
      id: "map-object",
      kind: "map-object",
      label: "Map Object",
      evidence: evidence("schema-graph-map-object", MAP_CONTENT_EVIDENCE),
    },
    {
      id: "asset",
      kind: "asset",
      label: "Asset",
      evidence: evidence("schema-graph-asset", ASSET_EVIDENCE),
    },
    {
      id: "npc-environment-policy",
      kind: "npc-environment-policy",
      label: "NPC Environment Policy",
      evidence: evidence("schema-graph-npc-environment-policy", NPC_ENVIRONMENT_POLICY_EVIDENCE),
    },
    {
      id: "npc-archetype",
      kind: "npc-archetype",
      label: "NPC Archetype",
      evidence: evidence("schema-graph-npc-archetype", NPC_ARCHETYPE_EVIDENCE),
    },
    {
      id: "npc-role",
      kind: "npc-role",
      label: "NPC Role / Job",
      evidence: evidence("schema-graph-npc-role", NPC_ROLE_EVIDENCE),
    },
    {
      id: "npc-personality",
      kind: "npc-personality",
      label: "NPC Personality / Traits",
      evidence: evidence("schema-graph-npc-personality", NPC_PERSONALITY_EVIDENCE),
    },
  );

  const edges: SchemaEdge[] = [
    {
      from: "world",
      relation: "contains",
      to: "region",
      evidence: evidence("schema-graph-world-region", MAP_HIERARCHY_EVIDENCE),
    },
    {
      from: "region",
      relation: "contains",
      to: "playable-exterior",
      evidence: evidence("schema-graph-region-playable", MAP_HIERARCHY_EVIDENCE),
    },
    {
      from: "playable-exterior",
      relation: "owns",
      to: "playable-interior",
      evidence: evidence("schema-graph-exterior-interior", PLAYABLE_EVIDENCE),
    },
    {
      from: "map",
      relation: "contains",
      to: "map-layer",
      evidence: evidence("schema-graph-map-layers", MAP_CONTENT_EVIDENCE),
    },
    {
      from: "map-layer",
      relation: "stores",
      to: "terrain-cell",
      evidence: evidence("schema-graph-layer-terrain", MAP_CONTENT_EVIDENCE),
    },
    {
      from: "map-layer",
      relation: "stores",
      to: "map-object",
      evidence: evidence("schema-graph-layer-objects", MAP_CONTENT_EVIDENCE),
    },
    {
      from: "map-object",
      relation: "references",
      to: "asset",
      evidence: evidence("schema-graph-object-asset", MAP_CONTENT_EVIDENCE),
    },
    {
      from: "npc",
      relation: "supports",
      to: "npc-environment-policy",
      evidence: evidence("schema-graph-npc-environment-policy-edge", NPC_ENVIRONMENT_POLICY_EVIDENCE),
    },
    {
      from: "npc",
      relation: "classified-by",
      to: "npc-archetype",
      evidence: evidence("schema-graph-npc-archetype-edge", NPC_ARCHETYPE_EVIDENCE),
    },
    {
      from: "npc",
      relation: "described-by",
      to: "npc-role",
      evidence: evidence("schema-graph-npc-role-edge", NPC_ROLE_EVIDENCE),
    },
    {
      from: "npc",
      relation: "described-by",
      to: "npc-personality",
      evidence: evidence("schema-graph-npc-personality-edge", NPC_PERSONALITY_EVIDENCE),
    },
  ];

  return { generatedAt: new Date().toISOString(), nodes, edges };
}
