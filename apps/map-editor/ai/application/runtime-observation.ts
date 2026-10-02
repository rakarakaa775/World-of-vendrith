import type { RuntimeAiRequest, RuntimeObservation } from "../domain/runtime";
import type { RuntimeObservationSource } from "../ports/runtime";

export function createRuntimeObservationPort(
  source: RuntimeObservationSource,
) {
  return {
    async observe(request: RuntimeAiRequest): Promise<RuntimeObservation> {
      const snapshot = await source.snapshot(request);
      return {
        id: `${request.id}:observation:${snapshot.state.stateVersion}`,
        surface: request.surface,
        intelligence: request.intelligence,
        state: snapshot.state,
        perception: snapshot.perception,
        facts: snapshot.facts,
      };
    },
  };
}
