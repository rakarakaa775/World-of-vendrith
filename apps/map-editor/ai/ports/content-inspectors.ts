import type { Evidence } from "../domain/types";
import type { MapInspectorPort, MapInspectionResult } from "./map-tools";
import type { AssetRegistryPort } from "./project-tools";

export type ContentInspectorType = "world" | "region" | "playable" | "asset";

export interface ContentInspectorResult {
  found: boolean;
  id: string;
  type: ContentInspectorType;
  map?: MapInspectionResult;
  hierarchy?: { parentMapId: string | null; childMapIds: string[]; childCount: number; parentPlayableMapId?: string | null };
  assets?: Array<{ assetId: string; evidence: Evidence[]; licenseState: string; usageDomain: string }>;
  evidence: Evidence[];
  warnings: string[];
}

export interface ContentInspectorDependencies {
  map: MapInspectorPort;
  assetRegistry: AssetRegistryPort;
}
