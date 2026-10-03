import type { SupabaseClient } from "@supabase/supabase-js";
import type { RuntimeEntity } from "../domain/runtime";
import type { NavigationGrid } from "../domain/runtime-navigation";
import type { RuntimeWorldSnapshot } from "./runtime-world-adapter";

type RuntimeSupabaseClient = SupabaseClient;

interface MapRow {
  id: string;
  world_id: string | null;
  name: string;
  map_type: string;
  width: number;
  height: number;
  metadata: Record<string, unknown> | null;
  updated_at: string;
}

interface NavigationCellRow {
  x: number;
  y: number;
  walkable: boolean;
  collision: boolean;
}

interface SeedRow {
  seed_key: string;
  name: string;
  race: string | null;
  occupation_name: string | null;
  settlement_name: string | null;
  location_name: string | null;
}

interface SeedEntryRow {
  seed_key: string;
  location_id: string | null;
}

interface PlacementRow {
  map_id: string;
  entity_type: string | null;
  entity_id: string | null;
  x: number | string | null;
  y: number | string | null;
  properties: Record<string, unknown> | null;
}

function toPosition(value: number | string | null): number | null {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) ? numberValue : null;
}

function entityFromPlacement(
  placement: PlacementRow,
  seedByKey: Map<string, SeedRow>,
): RuntimeEntity | undefined {
  if (placement.entity_type !== "npc" && placement.entity_type !== "npc_spawn") return undefined;
  const seedKey = placement.properties?.seed_key ?? placement.properties?.npc_seed_key;
  if (typeof seedKey !== "string") return undefined;
  const seed = seedByKey.get(seedKey);
  const x = toPosition(placement.x);
  const y = toPosition(placement.y);
  if (!seed || x === null || y === null) return undefined;

  return {
    id: placement.entity_id ?? seed.seed_key,
    kind: "npc",
    mapId: placement.map_id,
    position: { x, y },
    state: {
      seedKey: seed.seed_key,
      name: seed.name,
      race: seed.race ?? undefined,
      occupationName: seed.occupation_name ?? undefined,
      settlementName: seed.settlement_name ?? undefined,
      locationName: seed.location_name ?? undefined,
      blocksMovement: true,
    },
  };
}

export interface SupabaseRuntimeWorldAdapter {
  load(mapId: string): Promise<{
    snapshot: RuntimeWorldSnapshot;
    grid: NavigationGrid;
  } | undefined>;
}

export function createSupabaseRuntimeWorldAdapter(
  client: RuntimeSupabaseClient,
): SupabaseRuntimeWorldAdapter {
  return {
    async load(mapId) {
      const mapResult = await client
        .from("maps")
        .select("id,world_id,name,map_type,width,height,metadata,updated_at")
        .eq("id", mapId)
        .maybeSingle();
      if (mapResult.error || !mapResult.data) return undefined;

      const map = mapResult.data as MapRow;
      const navResult = await client
        .from("vandrith_map_navigation_grid")
        .select("x,y,walkable,collision")
        .eq("map_id", mapId)
        .order("y")
        .order("x");
      if (navResult.error) return undefined;

      const blocked = Array(map.width * map.height).fill(true);
      for (const cell of (navResult.data ?? []) as NavigationCellRow[]) {
        if (cell.x < 0 || cell.y < 0 || cell.x >= map.width || cell.y >= map.height) continue;
        blocked[cell.y * map.width + cell.x] = cell.collision || !cell.walkable;
      }

      const seedsResult = await client
        .from("npc_seed_catalog")
        .select("seed_key,name,race,occupation_name,settlement_name,location_name")
        .eq("active", true);
      const entriesResult = await client
        .from("npc_seed_entries")
        .select("seed_key,location_id");
      const placementsResult = await client
        .from("vandrith_unified_object_placement")
        .select("map_id,entity_type,entity_id,x,y,properties")
        .eq("map_id", mapId);

      if (seedsResult.error || entriesResult.error || placementsResult.error) return undefined;

      const seedByKey = new Map(
        ((seedsResult.data ?? []) as SeedRow[]).map(seed => [seed.seed_key, seed]),
      );
      const locationBySeed = new Map(
        ((entriesResult.data ?? []) as SeedEntryRow[]).map(entry => [entry.seed_key, entry.location_id]),
      );
      const entities = ((placementsResult.data ?? []) as PlacementRow[])
        .map(placement => entityFromPlacement(placement, seedByKey))
        .filter((entity): entity is RuntimeEntity => Boolean(entity))
        .filter(entity => locationBySeed.has(String(entity.state?.seedKey)));

      const updatedAt = new Date(map.updated_at).getTime();
      const stateVersion = Number.isFinite(updatedAt)
        ? `supabase:${map.id}:${updatedAt}`
        : `supabase:${map.id}:unknown`;

      return {
        snapshot: {
          state: {
            worldId: map.world_id ?? "unknown-world",
            clock: { tick: 0, day: 1, hour: 0, minute: 0, season: "spring" },
            activeEventIds: [],
            stateVersion,
            activeRegionId: map.metadata?.activeRegionId as string | undefined,
          },
          entities,
        },
        grid: { width: map.width, height: map.height, blocked },
      };
    },
  };
}
