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
