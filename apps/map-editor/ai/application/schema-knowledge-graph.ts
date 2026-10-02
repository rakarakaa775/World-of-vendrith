import type { Evidence } from "../domain/types";
import type { RepositoryPort } from "../ports/project-tools";
import { buildProjectSchemaSummary, type SchemaArea } from "./schema-intelligence";

export type SchemaNodeKind = SchemaArea | "playable-exterior" | "playable-interior";

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
  ];

  return { generatedAt: new Date().toISOString(), nodes, edges };
}
