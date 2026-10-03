import type { Evidence } from "./types";

export type AiSurface = "creator" | "engine" | "game";

export type RuntimeIntelligence =
  | "world"
  | "npc"
  | "dialogue"
  | "event"
  | "life";

export type RuntimeActionRisk = "safe" | "game-rule" | "high-risk";

export interface GameClock {
  tick: number;
  day: number;
  hour: number;
  minute: number;
  season: string;
  year?: number;
}

export interface GameWorldState {
  worldId: string;
  clock: GameClock;
  weather?: string;
  environmentConditions?: Record<string, unknown>;
  activeRegionId?: string;
  activeEventIds: string[];
  stateVersion: string;
}

export interface RuntimeEntity {
  id: string;
  kind: "player" | "npc" | "animal" | "object";
  mapId: string;
  position: { x: number; y: number };
  state?: Record<string, unknown>;
}

export interface RuntimePerception {
  self?: RuntimeEntity;
  nearbyEntities: RuntimeEntity[];
  visibleMapIds: string[];
  environment: {
    weather?: string;
    season?: string;
    activeRegionId?: string;
    conditions?: Record<string, unknown>;
  };
}

export interface RuntimeObservation {
  id: string;
  surface: "engine" | "game";
  intelligence: RuntimeIntelligence;
  state: GameWorldState;
  perception?: RuntimePerception;
  facts: Evidence[];
}

export interface RuntimeAction {
  id: string;
  intelligence: RuntimeIntelligence;
  type: string;
  payload: Record<string, unknown>;
  risk: RuntimeActionRisk;
  reason: string;
}

export interface RuntimeDecision {
  id: string;
  observationId: string;
  stateVersion: string;
  actions: RuntimeAction[];
  expiresAtTick?: number;
  evidence: Evidence[];
}

export interface CreatorContext {
  projectId: string;
  requestId: string;
  selectedMapId?: string;
  selectedRegionId?: string;
}

export interface RuntimeAiRequest {
  id: string;
  surface: "engine" | "game";
  intelligence: RuntimeIntelligence;
  observation: RuntimeObservation;
  goal: string;
}

export interface AiCoreCapabilities {
  observe: boolean;
  explain: boolean;
  plan: boolean;
  proposeRuntimeActions: boolean;
  executeRuntimeActions: boolean;
  mutateProject: boolean;
  verify: boolean;
}
