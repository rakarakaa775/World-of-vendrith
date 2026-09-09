export type Selection = { x: number; y: number; width: number; height: number };

export function normalizeSelection(a: { x: number; y: number }, b: { x: number; y: number }): Selection {
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
  return { x, y, width: Math.abs(a.x - b.x) + 1, height: Math.abs(a.y - b.y) + 1 };
}
