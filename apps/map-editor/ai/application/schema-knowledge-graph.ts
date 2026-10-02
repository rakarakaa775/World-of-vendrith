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
  | "asset";

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
  ];

  return { generatedAt: new Date().toISOString(), nodes, edges };
}
