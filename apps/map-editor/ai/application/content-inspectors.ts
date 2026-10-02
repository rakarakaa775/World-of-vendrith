import type { Evidence } from "../domain/types";
import { classifyAssetEvidence } from "../policies/asset-policy";
import type { ContentInspectorDependencies, ContentInspectorResult } from "../ports/content-inspectors";
import { inspectMap } from "./map-inspector";

async function inspectTypedMap(id: string, type: "world" | "region", deps: ContentInspectorDependencies): Promise<ContentInspectorResult> {
  const map = await deps.map.resolveMap(id);
  if (!map) return { found: false, id, type, evidence: [], warnings: ["No authoritative map snapshot was found."] };
  if (map.document.mapType !== type) {
    return { found: false, id, type, evidence: [], warnings: [`Authoritative map is ${map.document.mapType}, not ${type}.`] };
  }
  const inspected = await inspectMap(id, deps);
  const childMapIds = [...new Set(map.document.layers.flatMap((layer) => layer.objects.flatMap((object) => [object.playableMapId, object.childMapId, object.interiorMapId]).filter((value): value is string => Boolean(value))))];
  const hierarchyEvidence: Evidence = {
    id: `${type}-inspector-hierarchy-${id}`,
    kind: "verified-fact",
    source: map.source,
    fact: `${type} ${id} has parent ${map.document.parentMapId ?? "none"} and ${childMapIds.length} linked child map(s).`,
    confidence: "high",
  };
  return {
    found: true,
    id,
    type,
    map: inspected,
    hierarchy: { parentMapId: map.document.parentMapId, childMapIds, childCount: childMapIds.length },
    assets: inspected.assets?.map((asset) => ({ assetId: asset.assetId, evidence: [asset], licenseState: asset.licenseState ?? "unknown", usageDomain: asset.usageDomain ?? "review" })),
    evidence: [...inspected.evidence, hierarchyEvidence],
    warnings: inspected.warnings,
  };
}

export async function inspectWorld(id: string, deps: ContentInspectorDependencies) {
  return inspectTypedMap(id.trim(), "world", deps);
}

export async function inspectRegion(id: string, deps: ContentInspectorDependencies) {
  return inspectTypedMap(id.trim(), "region", deps);
}

export async function inspectAsset(id: string, deps: ContentInspectorDependencies): Promise<ContentInspectorResult> {
  const requested = id.trim();
  if (!requested) throw new Error("Asset id is required.");
  const matches = await deps.assetRegistry.search(requested);
  const exact = matches.find((item) => {
    const source = item.source.toLowerCase();
    const fact = item.fact.toLowerCase();
    return source.includes(requested.toLowerCase()) || fact.includes(`\"id\":\"${requested.toLowerCase()}\"`);
  });
  if (!exact) return { found: false, id: requested, type: "asset", evidence: [], warnings: ["No verified asset registry evidence was found for this asset."] };
  const intelligence = classifyAssetEvidence(exact);
  const evidence: Evidence = {
    ...exact,
    id: `asset-inspector-${exact.id}`,
    fact: `${exact.fact} Classification: ${intelligence.usageDomain}. License state: ${intelligence.licenseState}. ${intelligence.reason}`,
  };
  return { found: true, id: requested, type: "asset", assets: [{ assetId: requested, evidence: [evidence], licenseState: intelligence.licenseState, usageDomain: intelligence.usageDomain }], evidence: [evidence], warnings: intelligence.licenseState === "unknown" ? ["License is not sufficiently verified for safe inclusion."] : [] };
}

export interface ContentTraceNode {
  id: string;
  mapType: string;
  parentMapId: string | null;
  depth: number;
  childMapIds: string[];
  assetIds: string[];
  evidence: Evidence[];
}

export interface ContentTraceResult {
  found: boolean;
  rootId: string;
  nodes: ContentTraceNode[];
  edges: Array<{ from: string; relation: string; to: string; evidence: Evidence[] }>;
  evidence: Evidence[];
  warnings: string[];
}

/**
 * Follow authoritative map links with a small depth limit. This is deliberately
 * bounded and read-only so Creator AI can trace hierarchy without turning a
 * malformed map graph into an unbounded traversal.
 */
export async function traceContentHierarchy(id: string, deps: ContentInspectorDependencies, maxDepth = 3): Promise<ContentTraceResult> {
  const rootId = id.trim();
  if (!rootId) throw new Error("Map id is required.");
  const nodes: ContentTraceNode[] = [];
  const edges: ContentTraceResult["edges"] = [];
  const evidence: Evidence[] = [];
  const warnings: string[] = [];
  const visited = new Set<string>();
  const queue: Array<{ id: string; depth: number }> = [{ id: rootId, depth: 0 }];

  while (queue.length) {
    const current = queue.shift()!;
    if (visited.has(current.id) || current.depth > maxDepth) continue;
    visited.add(current.id);
    const resolved = await deps.map.resolveMap(current.id);
    if (!resolved) {
      warnings.push(`Linked map ${current.id} has no authoritative snapshot.`);
      continue;
    }
    const objectLinks = resolved.document.layers.flatMap((layer) => layer.objects.flatMap((object) => [object.playableMapId, object.childMapId, object.interiorMapId].filter((value): value is string => Boolean(value))));
    const childMapIds = [...new Set(objectLinks)];
    const assetIds = [...new Set(resolved.document.layers.flatMap((layer) => layer.objects.map((object) => object.assetId).filter(Boolean)))];
    const nodeEvidence: Evidence = { id: `content-trace-${current.id}`, kind: "verified-fact", source: resolved.source, fact: `Authoritative ${resolved.document.mapType} map ${current.id} resolved at version ${resolved.version}.`, confidence: "high" };
    nodes.push({ id: current.id, mapType: resolved.document.mapType, parentMapId: resolved.document.parentMapId, depth: current.depth, childMapIds, assetIds, evidence: [nodeEvidence] });
    evidence.push(nodeEvidence);

    if (resolved.document.parentMapId) {
      edges.push({ from: resolved.document.parentMapId, relation: "contains", to: current.id, evidence: [nodeEvidence] });
      if (current.depth < maxDepth) queue.push({ id: resolved.document.parentMapId, depth: current.depth + 1 });
    }
    for (const childId of childMapIds) {
      edges.push({ from: current.id, relation: "links", to: childId, evidence: [nodeEvidence] });
      if (current.depth < maxDepth) queue.push({ id: childId, depth: current.depth + 1 });
    }
  }

  if (!nodes.length) return { found: false, rootId, nodes, edges, evidence, warnings: ["No authoritative map snapshot was found.", ...warnings] };
  return { found: true, rootId, nodes, edges, evidence, warnings };
}
