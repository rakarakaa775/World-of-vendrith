import type { MapDocument } from "../../editor/map-document";
import type { RuntimeAiRequest, RuntimeEntity, RuntimeObservation } from "../domain/runtime";
import type { NavigationGrid } from "../domain/runtime-navigation";
import type { NpcBehaviorMemory, NpcBehaviorMemoryStore } from "../domain/runtime-behavior";
import { createRuntimeObservationPort } from "./runtime-observation";
import { createRuntimeWorldActionPort, createRuntimeWorldObservationSource, createRuntimeWorldVerificationPort, type RuntimeWorldStore } from "./runtime-world-adapter";
import { runNpcRuntimeTick, type NpcRuntimeTickResult } from "./npc-runtime-loop";
import type { RuntimeAiPorts } from "../ports/runtime";

export interface PreviewRuntimeSnapshot {
  entities: RuntimeEntity[];
  state: RuntimeObservation["state"];
}

export interface PreviewNpcSpawnAnchor {
  locationId: string;
  mapId: string;
  position: { x: number; y: number };
}

export interface PreviewNpcSeed {
  seedKey: string;
  name: string;
  race?: string | null;
  occupationName?: string | null;
  settlementName?: string | null;
  locationName?: string | null;
  locationId?: string | null;
  spawnAnchor?: PreviewNpcSpawnAnchor | null;
}

class MemoryStore implements NpcBehaviorMemoryStore {
  private readonly values = new Map<string, NpcBehaviorMemory>();
  get(npcId: string) { return this.values.get(npcId); }
  set(memory: NpcBehaviorMemory) { this.values.set(memory.npcId, memory); }
  clear(npcId: string) { this.values.delete(npcId); }
}

function buildGrid(document: MapDocument): NavigationGrid {
  const blocked = Array.from({ length: document.width * document.height }, () => false);
  const collision = document.layers.find(layer => layer.kind === "collision");
  if (collision) {
    collision.cells.forEach((cell, index) => { blocked[index] = Boolean(cell.tileId); });
    for (const object of collision.objects) {
      if (!object.collision) continue;
      for (let y = object.y; y < object.y + object.height; y++) {
        for (let x = object.x; x < object.x + object.width; x++) {
          if (x >= 0 && y >= 0 && x < document.width && y < document.height) blocked[y * document.width + x] = true;
        }
      }
    }
  }
  return { width: document.width, height: document.height, blocked };
}

export class PreviewRuntimeSimulation {
  private readonly entities: RuntimeEntity[];
  private readonly gridValue: NavigationGrid;
  private state: RuntimeObservation["state"];
  private readonly memory = new MemoryStore();
  private readonly store: RuntimeWorldStore;
  private readonly ports: RuntimeAiPorts;
  private readonly request: RuntimeAiRequest;

  constructor(document: MapDocument, npcSeeds: PreviewNpcSeed[] = []) {
    const centerX = Math.max(1, Math.floor(document.width / 2));
    const centerY = Math.max(1, Math.floor(document.height / 2));
    const seeds = npcSeeds.length > 0 ? npcSeeds : [{ seedKey: "preview-fallback", name: "Preview NPC", race: "human", occupationName: "wanderer" }];
    const npcs = seeds.slice(0, 8).map((seed, index) => ({
      id: `npc:${seed.seedKey}`,
      kind: "npc" as const,
      mapId: document.id,
      position: seed.spawnAnchor?.mapId === document.id && seed.spawnAnchor.locationId === seed.locationId
        ? { ...seed.spawnAnchor.position }
        : { x: Math.max(0, centerX - 3 - (index % 3)), y: Math.max(0, centerY + Math.floor(index / 3)) },
      state: {
        role: seed.occupationName ?? "wanderer",
        name: seed.name,
        race: seed.race ?? undefined,
        seedKey: seed.seedKey,
        settlementName: seed.settlementName ?? undefined,
        locationName: seed.locationName ?? undefined,
        locationId: seed.locationId ?? undefined,
      },
    }));
    this.entities = [
      ...npcs,
      { id: "preview-player", kind: "player", mapId: document.id, position: { x: centerX + 3, y: centerY }, state: { role: "player", blocksMovement: false } },
    ];
    this.gridValue = buildGrid(document);
    this.state = {
      worldId: document.id,
      clock: { tick: 0, day: 1, hour: 12, minute: 0, season: "spring" },
      weather: "clear",
      activeRegionId: document.parentMapId ?? undefined,
      activeEventIds: [],
      stateVersion: "preview-state-0",
    };
    this.store = {
      snapshot: () => ({ state: this.state, entities: this.entities.map(entity => ({ ...entity, position: { ...entity.position } })) }),
      grid: mapId => mapId === document.id ? this.gridValue : undefined,
      updateEntity: entity => {
        const index = this.entities.findIndex(candidate => candidate.id === entity.id);
        if (index >= 0) this.entities[index] = { ...entity, position: { ...entity.position } };
        this.state = { ...this.state, stateVersion: `preview-state-${this.state.clock.tick}-${index + 1}` };
      },
    };
    const source = createRuntimeWorldObservationSource(this.store);
    this.ports = {
      observation: createRuntimeObservationPort(source),
      decision: { decide: async (_request, observation) => ({ id: `preview-decision-${observation.id}`, observationId: observation.id, stateVersion: observation.state.stateVersion, actions: [], evidence: observation.facts }) },
      action: createRuntimeWorldActionPort(this.store),
      verification: createRuntimeWorldVerificationPort(this.store),
    };
    const initialObservation: RuntimeObservation = {
      id: "preview:observation:initial",
      surface: "game",
      intelligence: "npc",
      state: this.state,
      perception: { self: this.entities[0], nearbyEntities: [this.entities[1]], visibleMapIds: [document.id], environment: { weather: "clear", season: "spring", activeRegionId: document.parentMapId ?? undefined } },
      facts: [],
    };
    this.request = { id: "preview-npc-loop", surface: "game", intelligence: "npc", observation: initialObservation, goal: "Follow the nearby player." };
  }

  snapshot(): PreviewRuntimeSnapshot { return { entities: this.entities.map(entity => ({ ...entity, position: { ...entity.position } })), state: this.state }; }

  async tick(): Promise<NpcRuntimeTickResult> {
    this.state = {
      ...this.state,
      clock: { ...this.state.clock, tick: this.state.clock.tick + 1 },
      stateVersion: `preview-state-${this.state.clock.tick + 1}`,
    };
    this.request.observation = { ...this.request.observation, state: this.state };
    const result = await runNpcRuntimeTick(this.request, this.ports, this.store, this.memory);
    this.request.observation = result.observation;
    return result;
  }

}
