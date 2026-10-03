import type { RuntimeObservation, RuntimeEntity } from "../domain/runtime";

export type NpcWorldHazard = "storm" | "fire" | "flood" | "extreme-cold" | "extreme-heat" | "danger-zone";
export type NpcWorldResource = "food" | "water" | "shelter" | "work" | "social" | "medical";


export const NPC_WORLD_RESOURCE_KEYS = ["food", "water", "shelter", "work", "social", "medical"] as const;

export function hasNpcWorldResource(entity: RuntimeEntity, resource: NpcWorldResource): boolean {
  const state = entity.state;
  if (!state || typeof state !== "object" || Array.isArray(state)) return false;
  const record = state as Record<string, unknown>;
  return record.worldResource === resource
    || (Array.isArray(record.worldResources) && record.worldResources.includes(resource));
}

export interface NpcWorldAwareness {
  mapId?: string;
  regionId?: string;
  weather?: string;
  season?: string;
  nearbyEntityIds: readonly string[];
  hazards: readonly NpcWorldHazard[];
  resources: readonly NpcWorldResource[];
  resourceNeeds: readonly NpcWorldResource[];
  worldEventIds: readonly string[];
  timeOfDay: "night" | "morning" | "day" | "evening";
  travelRisk: number;
}

function normalized(value: unknown): string {
  return typeof value === "string" ? value.toLowerCase() : "";
}

function conditionFlag(conditions: Record<string, unknown> | undefined, key: string): boolean {
  return conditions?.[key] === true;
}

function conditionList(conditions: Record<string, unknown> | undefined, key: string): string[] {
  const value = conditions?.[key];
  return Array.isArray(value) ? value.filter(item => typeof item === "string") as string[] : [];
}

export function createNpcWorldAwareness(observation: RuntimeObservation): NpcWorldAwareness {
  const self = observation.perception?.self;
  const environment = observation.perception?.environment;
  const conditions = environment?.conditions ?? observation.state.environmentConditions;
  const weather = normalized(environment?.weather);
  const hazards: NpcWorldHazard[] = [];

  for (const hazard of conditionList(conditions, "hazards")) {
    if (["storm", "fire", "flood", "extreme-cold", "extreme-heat", "danger-zone"].includes(hazard)) hazards.push(hazard as NpcWorldHazard);
  }
  if (["storm", "blizzard", "hurricane"].includes(weather) && !hazards.includes("storm")) hazards.push("storm");
  if (["heatwave", "scorching"].includes(weather) && !hazards.includes("extreme-heat")) hazards.push("extreme-heat");
  if (["blizzard", "freezing"].includes(weather) && !hazards.includes("extreme-cold")) hazards.push("extreme-cold");
  if (conditionFlag(conditions, "fire_active") && !hazards.includes("fire")) hazards.push("fire");
  if (conditionFlag(conditions, "flood_active") && !hazards.includes("flood")) hazards.push("flood");
  if (conditionFlag(conditions, "danger_zone") && !hazards.includes("danger-zone")) hazards.push("danger-zone");

  const resourceKinds = NPC_WORLD_RESOURCE_KEYS;
  const resources = conditionList(conditions, "available_resources")
    .filter(item => resourceKinds.includes(item)) as NpcWorldResource[];
  const resourceNeeds = conditionList(conditions, "required_resources")
    .filter(item => resourceKinds.includes(item)) as NpcWorldResource[];

  const hour = observation.state.clock.hour;
  const timeOfDay = hour < 6 ? "night" : hour < 12 ? "morning" : hour < 18 ? "day" : hour < 22 ? "evening" : "night";
  const travelRisk = Math.min(100,
    hazards.length * 25 +
    (["storm", "blizzard", "hurricane", "heavy-rain"].includes(weather) ? 20 : 0) +
    (conditionFlag(conditions, "travel_restricted") ? 30 : 0),
  );

  return {
    mapId: self?.mapId,
    regionId: environment?.activeRegionId,
    weather: environment?.weather,
    season: environment?.season,
    nearbyEntityIds: (observation.perception?.nearbyEntities ?? []).map(entity => entity.id).sort(),
    hazards,
    resources: [...new Set(resources)].sort(),
    resourceNeeds: [...new Set(resourceNeeds)].sort(),
    worldEventIds: [...observation.state.activeEventIds].sort(),
    timeOfDay,
    travelRisk,
  };
}

export interface NpcWorldGoalContext {
  awareness: NpcWorldAwareness;
  goal: string;
  priority: number;
  needs?: { hunger: number; energy: number; social: number; safety: number };
}

export function applyNpcWorldAwarenessToGoal(context: NpcWorldGoalContext): number {
  let priority = context.priority;
  if (context.awareness.hazards.length > 0) {
    if (context.goal === "respond-to-event") priority += 40;
    else if (context.goal === "sleep" && context.awareness.hazards.includes("storm")) priority += 10;
    else priority -= Math.min(30, context.awareness.hazards.length * 5);
  }
  if (context.goal === "eat" && context.awareness.resources.includes("food")) priority += 10;
  if (context.goal === "work" && !context.awareness.resources.includes("work") && context.awareness.resources.length > 0) priority -= 5;
  if (context.goal === "socialize" && context.awareness.timeOfDay === "night") priority -= 10;
  if (context.goal === "sleep" && context.awareness.timeOfDay === "night") priority += 10;
  if (context.goal === "go-to-location") {
    priority -= Math.floor(context.awareness.travelRisk / 10);
    if (context.awareness.resourceNeeds.length > 0) priority += 25;
  }
  return priority;
}

export interface NpcWorldLocationAwareness {
  entityId: string;
  mapId: string;
  position: RuntimeEntity["position"];
  distance: number;
  visible: boolean;
}

export function rankWorldLocations(
  observation: RuntimeObservation,
  locations: readonly RuntimeEntity[],
): NpcWorldLocationAwareness[] {
  const self = observation.perception?.self;
  if (!self) return [];
  const activeRegionId = observation.perception?.environment?.activeRegionId;
  return locations
    .filter(location => location.mapId === self.mapId)
    .filter(location => {
      if (!activeRegionId) return true;
      const state = location.state;
      if (!state || typeof state !== "object" || Array.isArray(state)) return true;
      const regionId = (state as Record<string, unknown>).regionId;
      return typeof regionId !== "string" || regionId === activeRegionId;
    })
    .map(location => ({
      entityId: location.id,
      mapId: location.mapId,
      position: location.position,
      distance: Math.abs(location.position.x - self.position.x) + Math.abs(location.position.y - self.position.y),
      visible: (observation.perception?.nearbyEntities ?? []).some(entity => entity.id === location.id),
    }))
    .sort((a, b) => a.distance - b.distance || a.entityId.localeCompare(b.entityId));
}
