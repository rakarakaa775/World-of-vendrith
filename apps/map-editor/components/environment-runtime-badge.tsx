"use client";

import type { EnvironmentRuntimeState } from '../editor/environment-runtime';

export function EnvironmentRuntimeBadge({
  worldId,
  state,
  error,
}: {
  worldId: string | null;
  state: EnvironmentRuntimeState | null;
  error: string | null;
}) {
  const ready = state?.source === 'engine';
  const season = state?.context.seasonKey ?? '—';
  const weather = state?.context.weatherKey ?? '—';

  return (
    <div
      style={{
        position: 'fixed',
        right: 12,
        bottom: 12,
        zIndex: 20,
        minWidth: 220,
        padding: '8px 10px',
        border: '1px solid #334155',
        borderRadius: 6,
        background: '#0f172a',
        color: '#e2e8f0',
        fontSize: 11,
        boxShadow: '0 8px 24px rgba(0,0,0,.28)',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>
        Environment Runtime · {ready ? 'ENGINE' : 'INACTIVE'}
      </div>
      <div>World: {worldId ?? 'not configured'}</div>
      <div>Season: {season} · Weather: {weather}</div>
      {state?.clock && <div>Simulation: {state.clock.simulationAt}</div>}
      {error && <div style={{ marginTop: 4, opacity: 0.72 }}>Status: {error}</div>}
    </div>
  );
}
