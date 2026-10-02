[Reading 16 lines from start (total: 16 lines, 0 remaining)]

export type DebugViewId = "grid";

export type DebugViewState = Readonly<Record<DebugViewId, boolean>>;

export const DEFAULT_DEBUG_VIEW_STATE: DebugViewState = Object.freeze({
  grid: false,
});

export function setDebugViewEnabled(state: DebugViewState, view: DebugViewId, enabled: boolean): DebugViewState {
  if (state[view] === enabled) return state;
  return { ...state, [view]: enabled };
}

export function toggleDebugView(state: DebugViewState, view: DebugViewId): DebugViewState {
  return setDebugViewEnabled(state, view, !state[view]);
}

[executed on device: codespaces-e54cf0 (395fa14b-836a-48d6-b3c2-3cdaa0f364fc)]