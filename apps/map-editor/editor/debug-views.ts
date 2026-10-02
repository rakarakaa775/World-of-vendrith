export type DebugViewId = "grid" | "terrainId" | "waterDepth" | "collision" | "objectBounds" | "invalidCells";

export type DebugViewState = Readonly<Record<DebugViewId, boolean>>;

export const DEFAULT_DEBUG_VIEW_STATE: DebugViewState = Object.freeze({
  grid: false,
  terrainId: false,
  waterDepth: false,
  collision: false,
  objectBounds: false,
  invalidCells: false,
});

export function setDebugViewEnabled(state: DebugViewState, view: DebugViewId, enabled: boolean): DebugViewState {
  if (state[view] === enabled) return state;
  return { ...state, [view]: enabled };
}

export function toggleDebugView(state: DebugViewState, view: DebugViewId): DebugViewState {
  return setDebugViewEnabled(state, view, !state[view]);
}





