import type { RuntimeAiRequest, RuntimeEntity, RuntimeObservation } from "../domain/runtime";
import type { Evidence, VerificationResult } from "../domain/types";
import type { NavigationGrid } from "../domain/runtime-navigation";
import type { RuntimeMovementState } from "../domain/runtime-movement";
import type { RuntimeActionPort, RuntimeObservationSource, RuntimeVerificationPort } from "../ports/runtime";
import { executeNpcMovementStep } from "./npc-movement";
import { verifiedEvidence } from "./evidence";

export interface RuntimeWorldSnapshot {
  state: RuntimeObservation["state"];
  entities: RuntimeEntity[];
}

export interface RuntimeWorldStore {
  snapshot(): RuntimeWorldSnapshot;
  grid(mapId: string): NavigationGrid | undefined;
  updateEntity(entity: RuntimeEntity): void;
}

function nearbyEntities(snapshot: RuntimeWorldSnapshot, self: RuntimeEntity): RuntimeEntity[] {
  return snapshot.entities.filter(entity =>
    entity.id !== self.id &&
    entity.mapId === self.mapId &&
    Math.abs(entity.position.x - self.position.x) + Math.abs(entity.position.y - self.position.y) <= 8,
  );
}

export function createRuntimeWorldObservationSource(store: RuntimeWorldStore): RuntimeObservationSource {
  return {
    async snapshot(request: RuntimeAiRequest) {      const snapshot = store.snapshot();
      const requestedSelfId = request.observation.perception?.self?.id;
      const self = snapshot.entities.find(entity => entity.id === requestedSelfId)
        ?? snapshot.entities.find(entity => entity.kind === "npc");

      const perception = self ? {
        self,
        nearbyEntities: nearbyEntities(snapshot, self),
        visibleMapIds: [self.mapId],
        environment: {
          weather: snapshot.state.weather,
          season: snapshot.state.clock.season,
          activeRegionId: snapshot.state.activeRegionId,
        },
      } : undefined;

      const facts: Evidence[] = [
        verifiedEvidence("runtime-world-store", "Authoritative runtime snapshot at " + snapshot.state.stateVersion + "."),
      ];
      return { state: snapshot.state, perception, facts };
    },
  };
}

export function createRuntimeWorldActionPort(store: RuntimeWorldStore): RuntimeActionPort {
  return {
    async execute(action) {
      if (action.type !== "npc.navigate" || action.intelligence !== "npc" || action.risk !== "safe") {
        return { ok: false, actionId: action.id, detail: "Only safe npc.navigate actions are executable by this adapter." };
      }

      const snapshot = store.snapshot();
      const entityId = String(action.payload.entityId ?? "");
      const entity = snapshot.entities.find(candidate => candidate.id === entityId);
      const path = action.payload.path;
      if (!entity || entity.kind !== "npc" || !Array.isArray(path)) {
        return { ok: false, actionId: action.id, stateVersion: snapshot.state.stateVersion, detail: "NPC or navigation path was not found." };
      }

      const grid = store.grid(entity.mapId);
      if (!grid) {
        return { ok: false, actionId: action.id, stateVersion: snapshot.state.stateVersion, detail: "Navigation grid was not found." };
      }      const movementState: RuntimeMovementState = {
        entityId: entity.id,
        mapId: entity.mapId,
        position: entity.position,
        stateVersion: snapshot.state.stateVersion,
      };
      const result = executeNpcMovementStep(action, movementState, grid, snapshot.state.stateVersion);
      if (!result.ok) {
        return { ok: false, actionId: action.id, stateVersion: snapshot.state.stateVersion, detail: result.reason };
      }

      store.updateEntity({ ...entity, position: result.state.position });
      return { ok: true, actionId: action.id, stateVersion: store.snapshot().state.stateVersion, detail: result.reason };
    },
  };
}

export function createRuntimeWorldVerificationPort(store: RuntimeWorldStore): RuntimeVerificationPort {
  return {
    async verify(action, result): Promise<VerificationResult> {
      const checks: VerificationResult["checks"] = [
        { name: "action-id", ok: result.actionId === action.id },
        { name: "execution", ok: result.ok },
        { name: "state-version-returned", ok: typeof result.stateVersion === "string" && result.stateVersion.length > 0 },
      ];

      if (action.type === "npc.navigate" && action.intelligence === "npc") {
        const entity = store.snapshot().entities.find(candidate => candidate.id === String(action.payload.entityId ?? ""));
        const path = action.payload.path;
        const atPathPoint = entity && Array.isArray(path)
          ? path.some(point => point && point.x === entity.position.x && point.y === entity.position.y)
          : false;
        checks.push({ name: "npc-position-on-path", ok: atPathPoint });
      }

      return { ok: checks.every(check => check.ok), checks };
    },
  };
}
