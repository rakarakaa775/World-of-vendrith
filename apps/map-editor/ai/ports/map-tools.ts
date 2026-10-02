import type { Evidence } from "../domain/types";

export type MapInspectorMapType = "world" | "region" | "playable";
export type MapInspectorLayerKind = "ground" | "objects" | "collision";

export interface MapInspectorCell { tileId: string | null; }
export interface MapInspectorObject {
  id: string;
  kind: "building" | "decoration" | "poi";
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  assetId: string;
  assetName?: string;
  playableMapId?: string | null;
  childMapId?: string | null;
  interiorMapId?: string | null;
}

export interface MapInspectorLayer {
  id: string;
  name: string;
  kind: MapInspectorLayerKind;
  visible: boolean;
  cells: MapInspectorCell[];
  objects: MapInspectorObject[];
}

export interface MapInspectorDocument {
  id: string;
  name: string;
  mapType: MapInspectorMapType;
  parentMapId: string | null;
  width: number;
  height: number;
  tileSize: number;
  playableSpace?: "exterior" | "interior";
  parentPlayableMapId?: string | null;
  layers: MapInspectorLayer[];
}

export interface ResolvedMapForInspection {
  document: MapInspectorDocument;
  version: number;
  source: string;
}

export interface MapInspectorPort {
  resolveMap(mapId: string): Promise<ResolvedMapForInspection | null>;
}

export interface MapInspectionAssetEvidence extends Evidence {
  assetId: string;
  licenseState?: string;
  usageDomain?: string;
  reason?: string;
}

export interface MapInspectionResult {
  found: boolean;
  mapId: string;
  identity?: {
    id: string;
    name: string;
    mapType: MapInspectorMapType;
    parentMapId: string | null;
    playableSpace?: "exterior" | "interior";
    parentPlayableMapId?: string | null;
    width: number;
    height: number;
    tileSize: number;
    version: number;
  };
  layers?: Array<{
    id: string;
    name: string;
    kind: MapInspectorLayerKind;
    visible: boolean;
    populatedCells: number;
    objectCount: number;
  }>;
  terrain?: Array<{ tileId: string; count: number }>;
  objects?: Array<{
    id: string;
    kind: string;
    category: string;
    assetId: string;
    position: { x: number; y: number };
    linkedMapIds: string[];
  }>;
  assets?: MapInspectionAssetEvidence[];
  evidence: Evidence[];
  warnings: string[];
  source?: string;
}
