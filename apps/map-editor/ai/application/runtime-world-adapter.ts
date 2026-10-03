import type { RuntimeAiRequest, RuntimeDetection, RuntimeDetectionChannel, RuntimeEntity, RuntimeObservation } from "../domain/runtime";
import type { Evidence, VerificationResult } from "../domain/types";
import type { NavigationGrid } from "../domain/runtime-navigation";
import type { RuntimeMovementState } from "../domain/runtime-movement";
import type { RuntimeActionPort, RuntimeObservationSource, RuntimeVerificationPort } from "../ports/runtime";
import { executeNpcMovementStep } from "./npc-movement";
import { verifiedEvidence } from "./evidence";
import { effectiveNpcEnvironmentConditionsForEntity } from "./npc-environment-policy-runtime";

export interface RuntimeWorldSnapshot {
  state: RuntimeObservation["state"];
  entities: RuntimeEntity[];
}

export interface RuntimeWorldStore {
  snapshot(): RuntimeWorldSnapshot;
  grid(mapId: string): NavigationGrid | undefined;
  updateEntity(entity: RuntimeEntity): void;
}

function visibilityRadius(snapshot: RuntimeWorldSnapshot): number {
  const configured = snapshot.state.environmentConditions?.visibility_radius;
  return typeof configured === "number" && Number.isFinite(configured)
    ? Math.max(0, Math.min(64, Math.floor(configured)))
    : 8;
}

function sensingRule(snapshot: RuntimeWorldSnapshot, self: RuntimeEntity): Record<string, unknown> {
  const configured = effectiveNpcEnvironmentConditionsForEntity(snapshot.state.environmentConditions, self).npc_sensing;
  return configured && typeof configured === "object" && !Array.isArray(configured)
    ? configured as Record<string, unknown>
    : {};
}

function sensingRadius(snapshot: RuntimeWorldSnapshot, self: RuntimeEntity, key: "hearing_radius" | "smell_radius", fallback: number): number {
  const configured = sensingRule(snapshot, self)[key];
  return typeof configured === "number" && Number.isFinite(configured)
    ? Math.max(0, Math.min(64, Math.floor(configured)))
    : fallback;
}

function detectionModifier(snapshot: RuntimeWorldSnapshot, self: RuntimeEntity): number {
  const configured = sensingRule(snapshot, self).detection_modifier;
  return typeof configured === "number" && Number.isFinite(configured)
    ? Math.max(0, Math.min(4, configured))
    : 1;
}

function entityStimuli(entity: RuntimeEntity): Record<string, unknown> {
  const configured = entity.state?.sensory_stimuli;
  return configured && typeof configured === "object" && !Array.isArray(configured)
    ? configured as Record<string, unknown>
    : {};
}

function explicitStimulusRadius(entity: RuntimeEntity, key: "hearing_radius" | "smell_radius"): number {
  const configured = entityStimuli(entity)[key];
  return typeof configured === "number" && Number.isFinite(configured)
    ? Math.max(0, Math.min(64, configured))
    : 0;
}

function isVisible(entity: RuntimeEntity): boolean {
  return entityStimuli(entity).visibility !== false;
}

function detectionChannels(snapshot: RuntimeWorldSnapshot, self: RuntimeEntity, entity: RuntimeEntity): RuntimeDetectionChannel[] {
  const distance = Math.abs(entity.position.x - self.position.x) + Math.abs(entity.position.y - self.position.y);
  const modifier = detectionModifier(snapshot, self);
  const channels: RuntimeDetectionChannel[] = [];
  if (isVisible(entity) && distance <= visibilityRadius(snapshot)) channels.push("visibility");
  if (explicitStimulusRadius(entity, "hearing_radius") > 0
    && distance <= sensingRadius(snapshot, self, "hearing_radius", 8) * modifier) channels.push("hearing");
  if (explicitStimulusRadius(entity, "smell_radius") > 0
    && distance <= sensingRadius(snapshot, self, "smell_radius", 8) * modifier) channels.push("smell");
  return channels;
}

function nearbyEntities(snapshot: RuntimeWorldSnapshot, self: RuntimeEntity): RuntimeEntity[] {
  return snapshot.entities.filter(entity =>
    entity.id !== self.id &&
    entity.mapId === self.mapId &&
    detectionChannels(snapshot, self, entity).length > 0,
  );
}

function detections(snapshot: RuntimeWorldSnapshot, self: RuntimeEntity): RuntimeDetection[] {
  return nearbyEntities(snapshot, self).map(entity => ({
    entityId: entity.id,
    channels: detectionChannels(snapshot, self, entity),
    distance: Math.abs(entity.position.x - self.position.x) + Math.abs(entity.position.y - self.position.y),
  }));
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
        detections: detections(snapshot, self),
        visibleMapIds: [self.mapId],
        environment: {
          weather: snapshot.state.weather,
          season: snapshot.state.clock.season,
          activeRegionId: snapshot.state.activeRegionId,
          ...(snapshot.state.environmentConditions || self.state?.environmentPolicy
            ? { conditions: effectiveNpcEnvironmentConditionsForEntity(snapshot.state.environmentConditions, self) }
            : {}),
        },
        sensing: {
          hearingRadius: sensingRadius(snapshot, self, "hearing_radius", 8),
          smellRadius: sensingRadius(snapshot, self, "smell_radius", 8),
          detectionModifier: detectionModifier(snapshot, self),
        },
      } : undefined;

      const facts: Evidence[] = [
        verifiedEvidence("runtime-world-store", "Authoritative runtime snapshot at " + snapshot.state.stateVersion + "."),
        ...(perception?.detections ?? []).map(detection =>
          verifiedEvidence(
            `runtime-detection:${detection.entityId}`,
            `Entity ${detection.entityId} detected via ${detection.channels.join(", ")} at distance ${detection.distance}.`,
          ),
        ),
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
