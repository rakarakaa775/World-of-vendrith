import type { RuntimeAiRequest, RuntimeDecision, RuntimeObservation } from "../domain/runtime";
import type { NpcBehaviorMemoryStore } from "../domain/runtime-behavior";
import type { NavigationPoint } from "../domain/runtime-navigation";
import type { RuntimeAiPorts } from "../ports/runtime";
import { validateRuntimeDecision } from "../policies/runtime-policy";
import { createNpcBehaviorCandidates, decideNpcBehavior } from "./npc-behavior";
import { createRuntimeDecision } from "./runtime-decision";
import { decideNpcNavigation } from "./npc-navigation";
import type { RuntimeWorldStore } from "./runtime-world-adapter";

export interface NpcRuntimeTickResult {
  observation: RuntimeObservation;
  behavior: ReturnType<typeof createNpcBehaviorCandidates>[number] | undefined;
  decision?: RuntimeDecision;
  execution?: Awaited<ReturnType<RuntimeAiPorts["action"]["execute"]>>;
  verification?: Awaited<ReturnType<RuntimeAiPorts["verification"]["verify"]>>;
  status: "idle" | "moved" | "rejected" | "replan-required" | "invalid";
}

function targetFromBehavior(behavior: ReturnType<typeof createNpcBehaviorCandidates>[number], observation: RuntimeObservation): NavigationPoint | undefined {
  const targetId = behavior.action.payload.targetEntityId;
  if (typeof targetId === "string") {
    const target = observation.perception?.nearbyEntities.find(entity => entity.id === targetId);
    if (target?.position) return target.position;
  }
  const position = behavior.action.payload.position;
  if (position && typeof position === "object" && "x" in position && "y" in position) {
    const x = Number((position as { x: unknown }).x);
    const y = Number((position as { y: unknown }).y);
    if (Number.isInteger(x) && Number.isInteger(y)) return { x, y };
  }
  return undefined;
}
export async function runNpcRuntimeTick(
  request: RuntimeAiRequest,
  ports: RuntimeAiPorts,
  world: RuntimeWorldStore,
  memoryStore?: NpcBehaviorMemoryStore,
): Promise<NpcRuntimeTickResult> {
  const observation = await ports.observation.observe(request);
  const candidates = createNpcBehaviorCandidates(observation, observation.perception?.self ? memoryStore?.get(observation.perception.self.id) : undefined);
  if (!candidates.length) return { observation, behavior: undefined, status: "invalid" };

  const behaviorDecision = decideNpcBehavior(request, observation, undefined, memoryStore);
  const behavior = candidates.find(candidate => candidate.action.id === behaviorDecision.actions[0]?.id)
    ?? (behaviorDecision.actions[0]?.type === "npc.investigate"
      ? {
          kind: "investigate" as const,
          priority: 0,
          reason: behaviorDecision.actions[0]?.reason ?? "Investigate the last known target position.",
          action: behaviorDecision.actions[0],
        }
      : undefined);
  if (!behavior) return { observation, behavior: undefined, status: "invalid" };
  const goal = targetFromBehavior(behavior, observation);
  if (!goal) {
    const decision = createRuntimeDecision(request, observation, {
      actions: [behavior.action],
      evidence: observation.facts,
      expiresAtTick: observation.state.clock.tick + 1,
    });
    const validation = validateRuntimeDecision(decision, observation);
    return { observation, behavior, decision, status: validation.ok ? "idle" : "invalid" };
  }

  const self = observation.perception?.self;
  if (!self) return { observation, behavior, status: "invalid" };
  const grid = world.grid(self.mapId);
  if (!grid) return { observation, behavior, status: "rejected" };

  const navigationDecision = decideNpcNavigation(request, observation, grid, goal);
  if (!navigationDecision) {
    if (behavior.kind === "investigate" && memoryStore) {
      const previous = memoryStore.get(self.id);
      if (previous) {
        memoryStore.set({
          ...previous,
          lastFailure: "navigation",
          failureCount: (previous.failureCount ?? 0) + 1,
          updatedAtTick: observation.state.clock.tick,
          stateVersion: observation.state.stateVersion,
        });
      }
    }
    return { observation, behavior, status: "replan-required" };
  }
  const validation = validateRuntimeDecision(navigationDecision, observation);
  if (!validation.ok) return { observation, behavior, decision: navigationDecision, status: "invalid" };

  const action = navigationDecision.actions[0];
  const execution = await ports.action.execute(action, observation);
  const verification = await ports.verification.verify(action, execution);
  if (behavior.kind === "investigate" && memoryStore) {
    const previous = memoryStore.get(self.id);
    if (previous) {
      if (!execution.ok) {
        memoryStore.set({
          ...previous,
          lastFailure: "execution",
          failureCount: (previous.failureCount ?? 0) + 1,
          updatedAtTick: observation.state.clock.tick,
          stateVersion: observation.state.stateVersion,
        });
      } else if (!verification.ok) {
        memoryStore.set({
          ...previous,
          lastFailure: "verification",
          failureCount: (previous.failureCount ?? 0) + 1,
          updatedAtTick: observation.state.clock.tick,
          stateVersion: observation.state.stateVersion,
        });
      } else if (world.snapshot().entities.find(entity => entity.id === self.id)?.position?.x === goal.x && world.snapshot().entities.find(entity => entity.id === self.id)?.position?.y === goal.y) {
        memoryStore.clear(self.id);
      }
    }
  }
  return {
    observation,
    behavior,
    decision: navigationDecision,
    execution,
    verification,
    status: !execution.ok || !verification.ok ? "rejected" : "moved",
  };
}
