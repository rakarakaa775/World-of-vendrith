import type { PreviewNpcSeed, PreviewNpcSpawnAnchor } from "./preview-runtime-simulation";

export interface PreviewNpcSpawnAnchorMapRow {
  id: string;
  location_id: string | null;
}

export interface PreviewNpcSpawnAnchorPlacementRow {
  map_id: string;
  entity_type: string | null;
  entity_id: string | null;
  x: number | string | null;
  y: number | string | null;
  properties: Record<string, unknown> | null;
}

function propertySeedKey(properties: Record<string, unknown> | null): string | null {
  const value = properties?.seed_key ?? properties?.npc_seed_key;
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function resolvePreviewNpcSpawnAnchors(
  seeds: PreviewNpcSeed[],
  maps: PreviewNpcSpawnAnchorMapRow[],
  placements: PreviewNpcSpawnAnchorPlacementRow[],
): Map<string, PreviewNpcSpawnAnchor> {
  const mapByLocation = new Map(
    maps
      .filter(row => row.location_id)
      .map(row => [row.location_id as string, row]),
  );
  const result = new Map<string, PreviewNpcSpawnAnchor>();

  for (const seed of seeds) {
    if (!seed.locationId) continue;
    const map = mapByLocation.get(seed.locationId);
    if (!map) continue;

    const placement = placements.find(row =>
      row.map_id === map.id
      && (row.entity_type === "npc" || row.entity_type === "npc_spawn")
      && propertySeedKey(row.properties) === seed.seedKey
      && Number.isFinite(Number(row.x))
      && Number.isFinite(Number(row.y)),
    );
    if (!placement) continue;

    result.set(seed.seedKey, {
      locationId: seed.locationId,
      mapId: map.id,
      position: { x: Number(placement.x), y: Number(placement.y) },
    });
  }

  return result;
}
