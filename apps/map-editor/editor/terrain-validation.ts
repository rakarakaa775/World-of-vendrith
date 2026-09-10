import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';
import {
  TERRAIN_KEYS,
  neighborMask,
  terrainAt,
  terrainFromTileId,
  terrainVariantKey,
  type TerrainKey,
  type TerrainMask,
} from './terrain-engine';
import { getTerrainAssetBinding, type TerrainAssetBindingMap } from './terrain-asset-binding';

export type TerrainValidationStatus =
  | 'valid-logical'
  | 'valid-bound'
  | 'valid-fallback'
  | 'invalid';

export type TerrainValidationIssueCode =
  | 'invalid-layer'
  | 'layer-not-ground'
  | 'layer-locked'
  | 'layer-hidden'
  | 'outside-grid'
  | 'invalid-tile'
  | 'invalid-terrain'
  | 'invalid-mask';

export type TerrainValidationIssue = {
  code: TerrainValidationIssueCode;
  message: string;
  point?: GridPoint;
  terrain?: TerrainKey;
  mask?: TerrainMask;
};

export type TerrainValidationResult = {
  valid: boolean;
  status: TerrainValidationStatus;
  point: GridPoint;
  terrain: TerrainKey | null;
  mask: TerrainMask | null;
  variantKey: string | null;
  assetId: string | null;
  issues: TerrainValidationIssue[];
};

export type TerrainPaintValidation = {
  valid: boolean;
  status: TerrainValidationStatus;
  points: GridPoint[];
  issues: TerrainValidationIssue[];
};

export type TerrainValidationSummary = {
  valid: boolean;
  total: number;
  invalid: number;
  logical: number;
  bound: number;
  fallback: number;
  issues: TerrainValidationIssue[];
};

export function isValidTerrainKey(value: unknown): value is TerrainKey {
  return typeof value === 'string' && (TERRAIN_KEYS as readonly string[]).includes(value);
}

export function isValidTerrainMask(value: unknown): value is TerrainMask {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 0xff;
}

function invalidResult(
  point: GridPoint,
  issues: TerrainValidationIssue[],
): TerrainValidationResult {
  return {
    valid: false,
    status: 'invalid',
    point,
    terrain: null,
    mask: null,
    variantKey: null,
    assetId: null,
    issues,
  };
}

export function validateTerrainCell(
  document: MapDocument,
  layerId: string,
  point: GridPoint,
  bindings: TerrainAssetBindingMap = {},
): TerrainValidationResult {
  if (
    !Number.isInteger(point.x) ||
    !Number.isInteger(point.y) ||
    point.x < 0 ||
    point.y < 0 ||
    point.x >= document.width ||
    point.y >= document.height
  ) {
    return invalidResult(point, [
      { code: 'outside-grid', message: 'Cell is outside the map grid.', point },
    ]);
  }

  const layer = document.layers.find(item => item.id === layerId);
  if (!layer) {
    return invalidResult(point, [
      { code: 'invalid-layer', message: 'Terrain layer does not exist.', point },
    ]);
  }

  const issues: TerrainValidationIssue[] = [];
  if (layer.kind !== 'ground') {
    issues.push({ code: 'layer-not-ground', message: 'Terrain validation requires a ground layer.', point });
  }
  if (layer.locked) {
    issues.push({ code: 'layer-locked', message: 'Terrain layer is locked.', point });
  }
  if (!layer.visible) {
    issues.push({ code: 'layer-hidden', message: 'Terrain layer is hidden.', point });
  }
  if (issues.length > 0) return invalidResult(point, issues);

  const terrain = terrainAt(document, point, layerId);
  if (!terrain || !isValidTerrainKey(terrain)) {
    const tileId = layer.cells[point.y * document.width + point.x]?.tileId ?? null;
    return invalidResult(point, [
      {
        code: tileId ? 'invalid-terrain' : 'invalid-tile',
        message: tileId
          ? 'Cell does not resolve to a supported terrain.'
          : 'Cell does not contain a terrain tile.',
        point,
      },
    ]);
  }

  const mask = neighborMask(document, layerId, point, terrain);
  if (!isValidTerrainMask(mask)) {
    return invalidResult(point, [
      {
        code: 'invalid-mask',
        message: 'Terrain mask is outside the Wang-8 range.',
        point,
        terrain,
        mask,
      },
    ]);
  }

  const binding = getTerrainAssetBinding(bindings, terrain, mask);
  return {
    valid: true,
    status: binding ? 'valid-bound' : 'valid-fallback',
    point,
    terrain,
    mask,
    variantKey: terrainVariantKey(mask),
    assetId: binding?.assetId ?? null,
    issues: [],
  };
}

export function validateTerrainPaint(
  document: MapDocument,
  layerId: string,
  points: GridPoint[],
  tileId: string | null,
  bindings: TerrainAssetBindingMap = {},
): TerrainPaintValidation {
  const layer = document.layers.find(item => item.id === layerId);
  if (!layer) {
    return {
      valid: false,
      status: 'invalid',
      points: [],
      issues: [{ code: 'invalid-layer', message: 'Terrain layer does not exist.' }],
    };
  }
  if (layer.kind !== 'ground') {
    return {
      valid: false,
      status: 'invalid',
      points: [],
      issues: [{ code: 'layer-not-ground', message: 'Terrain painting is only allowed on a ground layer.' }],
    };
  }
  if (layer.locked) {
    return {
      valid: false,
      status: 'invalid',
      points: [],
      issues: [{ code: 'layer-locked', message: 'Terrain layer is locked.' }],
    };
  }
  if (!layer.visible) {
    return {
      valid: false,
      status: 'invalid',
      points: [],
      issues: [{ code: 'layer-hidden', message: 'Terrain layer is hidden.' }],
    };
  }

  const terrain = terrainFromTileId(tileId);
  if (!isValidTerrainKey(terrain)) {
    return {
      valid: false,
      status: 'invalid',
      points: [],
      issues: [{ code: tileId ? 'invalid-terrain' : 'invalid-tile', message: 'Selected tile does not resolve to a supported terrain.' }],
    };
  }

  const validPoints: GridPoint[] = [];
  const issues: TerrainValidationIssue[] = [];
  const seen = new Set<string>();
  for (const point of points) {
    const key = `${point.x}:${point.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (
      !Number.isInteger(point.x) ||
      !Number.isInteger(point.y) ||
      point.x < 0 ||
      point.y < 0 ||
      point.x >= document.width ||
      point.y >= document.height
    ) {
      issues.push({ code: 'outside-grid', message: 'One or more paint cells are outside the map grid.', point, terrain });
      continue;
    }
    validPoints.push(point);
  }

  if (issues.length > 0 || validPoints.length === 0) {
    return { valid: false, status: 'invalid', points: validPoints, issues };
  }

  const hasBinding = validPoints.some(point => {
    const mask = neighborMask(document, layerId, point, terrain);
    return getTerrainAssetBinding(bindings, terrain, mask) !== null;
  });

  return {
    valid: true,
    status: hasBinding ? 'valid-bound' : 'valid-logical',
    points: validPoints,
    issues: [],
  };
}

export function terrainValidationSummary(
  results: TerrainValidationResult[],
): TerrainValidationSummary {
  const invalid = results.filter(result => !result.valid).length;
  const logical = results.filter(result => result.status === 'valid-logical').length;
  const bound = results.filter(result => result.status === 'valid-bound').length;
  const fallback = results.filter(result => result.status === 'valid-fallback').length;
  return {
    valid: invalid === 0,
    total: results.length,
    invalid,
    logical,
    bound,
    fallback,
    issues: results.flatMap(result => result.issues),
  };
}
