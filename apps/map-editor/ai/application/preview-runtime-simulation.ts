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

  constructor(document: MapDocument) {
    const centerX = Math.max(1, Math.floor(document.width / 2));
    const centerY = Math.max(1, Math.floor(document.height / 2));
    this.entities = [
      { id: "preview-npc", kind: "npc", mapId: document.id, position: { x: centerX - 3, y: centerY }, state: { role: "wanderer" } },
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
