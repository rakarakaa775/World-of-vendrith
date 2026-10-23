import type { SupabaseClient } from "@supabase/supabase-js";
import type { RuntimeEntity } from "../domain/runtime";
import type { RuntimeScheduledEvent } from "../domain/runtime-clock";
import { validateNavigationWaterCells, type NavigationGrid, type NavigationWaterCell } from "../domain/runtime-navigation";
import type { RuntimeWorldSnapshot } from "./runtime-world-adapter";
import { decisionProfileFromMetadata } from "./npc-runtime-profile";
import { validatedNpcRuntimeSpawnContract } from "./npc-runtime-spawn-contract";
import { recoverWorldFromSupabase } from "./runtime-recovery";
import { parseMapSnapshot } from "../../editor/map-snapshot-v2";

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

interface SimulationClockRow {
  world_id: string;
  current_tick: number | string;
  current_date: string;
  speed: number | string;
  paused: boolean;
  updated_at: string;
}

interface EnvironmentClockRow {
  world_id: string;
  simulation_at: string;
  speed_multiplier: number | string;
  current_season_id: string | null;
  season_started_at: string | null;
  season_ends_at: string | null;
  updated_at: string;
  metadata: Record<string, unknown>;
}

interface EnvironmentStateRow {
  world_id: string;
  season_id: string | null;
  weather_state_id: string | null;
  state_started_at: string | null;
  state_ends_at: string | null;
  conditions: Record<string, unknown>;
  updated_at: string;
}

interface SeasonDefinitionRow { id: string; season_key: string; display_name: string; }
interface WeatherStateRow { id: string; weather_id: string; season_id: string | null; }
interface WeatherDefinitionRow { id: string; weather_key: string; display_name: string; }

interface TimeEventRow {
  id: string;
  world_id: string;
  scheduled_time: string;
  status: string;
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
  metadata: Record<string, unknown> | null;
}

interface SeedEntryRow {
  seed_key: string;
  location_id: string | null;
}

interface NpcRuntimeContractOverrideRow {
  seed_key: string;
  runtime_contract: unknown;
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
      ...(() => {
        const contract = validatedNpcRuntimeSpawnContract(seed.metadata?.npcRuntimeContract);
        if (contract) return {
          decisionProfile: contract.decisionProfile,
          environmentPolicy: contract.environmentPolicy,
          canSwim: contract.traversalCapabilities?.canSwim === true,
          hasWaterTransport: contract.traversalCapabilities?.hasWaterTransport === true,
        };
        const decisionProfile = decisionProfileFromMetadata(seed.metadata);
        return decisionProfile ? { decisionProfile } : {};
      })(),
    },
  };
}

export interface SupabaseRuntimeWorldAdapter {
  load(mapId: string): Promise<{
    snapshot: RuntimeWorldSnapshot;
    grid: NavigationGrid;
    scheduledEvents: RuntimeScheduledEvent[];
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
      if (!map.world_id) return undefined;

      const clockResult = await client
        .from("simulation_clock")
        .select("world_id,current_tick,current_date,speed,paused,updated_at")
        .eq("world_id", map.world_id)
        .maybeSingle();
      if (clockResult.error || !clockResult.data) return undefined;
      const clock = clockResult.data as SimulationClockRow;
      const currentDate = new Date(clock.current_date);
      if (!Number.isFinite(currentDate.getTime())) return undefined;

      const environmentClockResult = await client
        .from("world_environment_clocks")
        .select("world_id,simulation_at,speed_multiplier,current_season_id,season_started_at,season_ends_at,updated_at,metadata")
        .eq("world_id", map.world_id)
        .maybeSingle();
      if (environmentClockResult.error) return undefined;
      const environmentStateResult = await client
        .from("world_environment_states")
        .select("world_id,season_id,weather_state_id,state_started_at,state_ends_at,conditions,updated_at")
        .eq("world_id", map.world_id)
        .maybeSingle();
      if (environmentStateResult.error) return undefined;

      const environmentClock = environmentClockResult.data as EnvironmentClockRow | null;
      const environmentState = environmentStateResult.data as EnvironmentStateRow | null;
      const seasonId = environmentState?.season_id ?? environmentClock?.current_season_id ?? null;

      let season = "unknown";
      if (seasonId) {
        const seasonResult = await client
          .from("season_definitions")
          .select("id,season_key,display_name")
          .eq("id", seasonId)
          .maybeSingle();
        if (seasonResult.error) return undefined;
        const definition = seasonResult.data as SeasonDefinitionRow | null;
        if (definition) season = definition.season_key;
      }

      let weather: string | undefined;
      if (environmentState?.weather_state_id) {
        const weatherStateResult = await client
          .from("world_weather_states")
          .select("id,weather_id,season_id")
          .eq("id", environmentState.weather_state_id)
          .maybeSingle();
        if (weatherStateResult.error) return undefined;
        const weatherState = weatherStateResult.data as WeatherStateRow | null;
        if (weatherState?.weather_id) {
          const weatherDefinitionResult = await client
            .from("weather_definitions")
            .select("id,weather_key,display_name")
            .eq("id", weatherState.weather_id)
            .maybeSingle();
          if (weatherDefinitionResult.error) return undefined;
          const weatherDefinition = weatherDefinitionResult.data as WeatherDefinitionRow | null;
          weather = weatherDefinition?.weather_key;
        }
      }

      const timeEventsResult = await client
        .from("time_events")
        .select("id,world_id,scheduled_time,status")
        .eq("world_id", map.world_id)
        .eq("status", "scheduled");
      if (timeEventsResult.error) return undefined;
      const scheduledEvents = ((timeEventsResult.data ?? []) as TimeEventRow[]).flatMap(event => {
        const scheduledAt = new Date(event.scheduled_time);
        if (!Number.isFinite(scheduledAt.getTime())) return [];
        const deltaMinutes = Math.max(0, Math.ceil((scheduledAt.getTime() - currentDate.getTime()) / 60000));
        const startTick = Number(clock.current_tick) + Math.ceil(deltaMinutes / Math.max(0.000001, Number(clock.speed)));
        return [{ id: event.id, startTick, endTick: startTick + 1 }];
      });
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

      // The editor's authenticated snapshot RPC is the only source of authored
      // terrain semantics here. V1 snapshots deliberately contribute no water
      // semantics; V2 snapshots must validate completely before projection.
      const terrainSnapshotResult = await client.rpc("map_editor_get_runtime_snapshot_v1", { p_map_id: mapId });
      if (terrainSnapshotResult.error) return undefined;
      const terrainSnapshotEnvelope = Array.isArray(terrainSnapshotResult.data)
        ? terrainSnapshotResult.data[0]
        : terrainSnapshotResult.data;
      let waterCells: NavigationWaterCell[] | undefined;
      if (!terrainSnapshotEnvelope || typeof terrainSnapshotEnvelope !== "object" || Array.isArray(terrainSnapshotEnvelope)) {
        return undefined;
      }
      const snapshotResult = terrainSnapshotEnvelope as Record<string, unknown>;
      if (snapshotResult.ok !== true || typeof snapshotResult.found !== "boolean") return undefined;
      if (snapshotResult.found === false) {
        // A valid not-found response means this map has no authored terrain snapshot yet.
        if (snapshotResult.snapshot !== undefined && snapshotResult.snapshot !== null) return undefined;
      } else {
        if (snapshotResult.snapshot === undefined || snapshotResult.snapshot === null) return undefined;
        try {
          const parsed = parseMapSnapshot(snapshotResult.snapshot, mapId);
          if (parsed.format === "v2") {
            const validation = validateNavigationWaterCells(
              map.width,
              map.height,
              parsed.state.terrainSemantics.cells,
            );
            if (!validation.valid) return undefined;
            waterCells = validation.cells;
          }
        } catch {
          // Do not silently discard malformed or identity-mismatched persisted data.
          return undefined;
        }
      }

      const seedsResult = await client
        .from("npc_seed_catalog")
        .select("seed_key,name,race,occupation_name,settlement_name,location_name,metadata")
        .eq("active", true);
      const entriesResult = await client
        .from("npc_seed_entries")
        .select("seed_key,location_id");
      const contractOverridesResult = await client
        .from("npc_creator_runtime_contract_overrides")
        .select("seed_key,runtime_contract");
      const placementsResult = await client
        .from("vandrith_unified_object_placement")
        .select("map_id,entity_type,entity_id,x,y,properties")
        .eq("map_id", mapId);

      if (seedsResult.error || entriesResult.error || contractOverridesResult.error || placementsResult.error) return undefined;

      const seedByKey = new Map(
        ((seedsResult.data ?? []) as SeedRow[]).map(seed => [seed.seed_key, seed]),
      );
      for (const override of (contractOverridesResult.data ?? []) as NpcRuntimeContractOverrideRow[]) {
        const contract = validatedNpcRuntimeSpawnContract(override.runtime_contract);
        const seed = seedByKey.get(override.seed_key);
        // An invalid owner-scoped override is treated as corrupt durable state,
        // not silently ignored in favor of an older shared catalog contract.
        if (!seed) continue; // Ignore saved overrides for inactive/non-runtime seeds.
        if (!contract) return undefined;
        seedByKey.set(override.seed_key, {
          ...seed,
          metadata: { ...(seed.metadata ?? {}), npcRuntimeContract: contract },
        });
      }
      const locationBySeed = new Map(
        ((entriesResult.data ?? []) as SeedEntryRow[]).map(entry => [entry.seed_key, entry.location_id]),
      );
      const entities = ((placementsResult.data ?? []) as PlacementRow[])
        .map(placement => entityFromPlacement(placement, seedByKey))
        .filter((entity): entity is RuntimeEntity => Boolean(entity))
        .filter(entity => locationBySeed.has(String(entity.state?.seedKey)));

      const updatedAt = new Date(clock.updated_at).getTime();
      const stateVersion = Number.isFinite(updatedAt)
        ? `supabase:${map.id}:clock:${updatedAt}`
        : `supabase:${map.id}:clock:unknown`;
      const currentTick = Number(clock.current_tick);
      if (!Number.isInteger(currentTick) || currentTick < 0) return undefined;
      const activeEventIds = scheduledEvents
        .filter(event => event.startTick <= currentTick)
        .map(event => event.id);

      const baseSnapshot: RuntimeWorldSnapshot = {
        state: {
          worldId: map.world_id,
          clock: {
            tick: currentTick,
            day: currentDate.getUTCDate(),
            hour: currentDate.getUTCHours(),
            minute: currentDate.getUTCMinutes(),
            season,
            ...(weather ? { weather } : {}),
          },
          activeEventIds,
          stateVersion,
          activeRegionId: map.metadata?.activeRegionId as string | undefined,
        },
        entities,
      };

      const recoveredSnapshot = (await recoverWorldFromSupabase(
        client,
        map.world_id,
        baseSnapshot,
      )).snapshot;

      return {
        snapshot: recoveredSnapshot,
        grid: { width: map.width, height: map.height, blocked, ...(waterCells ? { waterCells } : {}) },
        scheduledEvents,
      };
    },
  };
}
