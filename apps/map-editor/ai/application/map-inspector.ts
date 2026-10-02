import type { Evidence } from "../domain/types";
import type {
  MapInspectionAssetEvidence,
  MapInspectorPort,
  MapInspectionResult,
  ResolvedMapForInspection,
} from "../ports/map-tools";
import { classifyAssetEvidence } from "../policies/asset-policy";
import type { AssetRegistryPort } from "../ports/project-tools";

const TERRAIN_KEYS = [
  "deepwater2", "deepwater", "brackish", "water", "grass", "sand", "dirt",
] as const;

function terrainKey(tileId: string): string {
  const normalized = tileId.toLowerCase();
  for (const key of TERRAIN_KEYS) if (normalized.includes(key)) return key;
  return tileId;
}

function baseEvidence(map: ResolvedMapForInspection): Evidence[] {
  return [{
    id: `map-inspector-${map.document.id}-${map.version}`,
    kind: "verified-fact",
    source: map.source,
    fact: `Authoritative map snapshot ${map.document.id} was resolved at version ${map.version}.`,
    confidence: "high",
  }];
}

export async function inspectMap(
  mapId: string,
  dependencies: { map: MapInspectorPort; assetRegistry: AssetRegistryPort },
): Promise<MapInspectionResult> {
  const requested = mapId.trim();
  if (!requested) throw new Error("Map id is required.");

  const resolved = await dependencies.map.resolveMap(requested);
  if (!resolved) return { found: false, mapId: requested, evidence: [], warnings: ["No authoritative map snapshot was found." ] };

  const document = resolved.document;
  const layers = document.layers.map((layer) => ({
    id: layer.id,
    name: layer.name,
    kind: layer.kind,
    visible: layer.visible,
    populatedCells: layer.cells.filter((cell) => cell.tileId !== null).length,
    objectCount: layer.objects.length,
  }));

  const terrainCounts = new Map<string, number>();
  for (const layer of document.layers) {
    if (layer.kind !== "ground") continue;
    for (const cell of layer.cells) {
      if (!cell.tileId) continue;
      const key = terrainKey(cell.tileId);
      terrainCounts.set(key, (terrainCounts.get(key) ?? 0) + 1);
    }
  }

  const objects = document.layers.flatMap((layer) => layer.objects).map((object) => ({
    id: object.id,
    kind: object.kind,
    category: object.category,
    assetId: object.assetId,
    position: { x: object.x, y: object.y },
    linkedMapIds: [object.playableMapId, object.childMapId, object.interiorMapId].filter((id): id is string => Boolean(id)),
  }));

  const uniqueAssetIds = [...new Set(objects.map((object) => object.assetId).filter(Boolean))];
  const assetEvidence: MapInspectionAssetEvidence[] = [];
  const warnings: string[] = [];

  for (const assetId of uniqueAssetIds) {
    const matches = await dependencies.assetRegistry.search(assetId);
    if (matches.length === 0) {
      warnings.push(`No verified asset registry evidence found for asset ${assetId}.`);
      continue;
    }
    const classified = classifyAssetEvidence(matches[0]);
    assetEvidence.push({
      ...classified.evidence,
      assetId,
      licenseState: classified.licenseState,
      usageDomain: classified.usageDomain,
      reason: classified.reason,
    });
  }

  const evidence = baseEvidence(resolved);
  evidence.push({
    id: `map-inspector-schema-${document.id}`,
    kind: "verified-fact",
    source: "repository:apps/map-editor/editor/map-document.ts",
    fact: `MapDocument contains ${document.layers.length} layers, ${document.width}×${document.height} cells, and map type ${document.mapType}.`,
    confidence: "high",
  });
  evidence.push({
    id: `map-inspector-terrain-${document.id}`,
    kind: "verified-fact",
    source: "repository:apps/map-editor/editor/terrain-engine.ts",
    fact: "Terrain inspection preserves distinct water/brackish/deepwater2/deepwater terrain bands when present in tile IDs.",
    confidence: "high",
  });

  return {
    found: true,
    mapId: requested,
    identity: {
      id: document.id,
      name: document.name,
      mapType: document.mapType,
      parentMapId: document.parentMapId,
      playableSpace: document.playableSpace,
      parentPlayableMapId: document.parentPlayableMapId,
      width: document.width,
      height: document.height,
      tileSize: document.tileSize,
      version: resolved.version,
    },
    layers,
    terrain: [...terrainCounts.entries()].map(([tileId, count]) => ({ tileId, count })),
    objects,
    assets: assetEvidence,
    evidence: [...evidence, ...assetEvidence],
    warnings,
    source: resolved.source,
  };
}
