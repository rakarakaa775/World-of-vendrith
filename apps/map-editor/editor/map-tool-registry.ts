import type { MapDocument, MapType } from "./map-document";

export type MapEditorToolId =
  | "select" | "pan" | "terrain" | "stamp" | "erase"
  | "settlement" | "infrastructure" | "nature" | "building" | "decoration"
  | "gameplay" | "collision" | "floor" | "wall" | "door" | "furniture";

export type MapPaletteSectionId =
  | "navigation" | "terrain" | "region" | "nature" | "buildings" | "interior" | "gameplay";

export type MapPaletteSection = {
  id: MapPaletteSectionId;
  label: string;
  tools: MapEditorToolId[];
};

export type MapAssetFamily =
  | "macro-terrain"
  | "region-settlement"
  | "region-infrastructure"
  | "region-landmark"
  | "playable-nature"
  | "playable-building"
  | "playable-decoration"
  | "interior-floor"
  | "interior-wall"
  | "interior-door"
  | "interior-furniture";

export type MapAssetDefinition = {
  id: string;
  label: string;
  family: MapAssetFamily;
  /** The editor levels where this asset is semantically valid. */
  levels: Array<MapType | "interior">;
  /** Physical registry identity. When present, placed objects persist this UUID in assetId. */
  registryId?: string;
  assetPath?: string;
  previewUrl?: string;
  usageStatus?: string | null;
  attributionRequired?: boolean | null;
};

/**
 * Asset semantics are intentionally separate from the physical asset registry.
 * The same source art can therefore be reused at different scales without
 * making World/Region/Playable palettes identical.
 */
export const MAP_ASSET_CATALOG: MapAssetDefinition[] = [
  { id: "forest", label: "Forest", family: "macro-terrain", levels: ["world", "region"] },
  { id: "mountain", label: "Mountain", family: "macro-terrain", levels: ["world", "region"] },
  { id: "plains", label: "Plains", family: "macro-terrain", levels: ["world", "region"] },
  { id: "ocean", label: "Ocean", family: "macro-terrain", levels: ["world"] },
  { id: "lake", label: "Lake", family: "macro-terrain", levels: ["world", "region"] },
  { id: "river", label: "River", family: "macro-terrain", levels: ["world", "region"] },
  { id: "capital", label: "Capital", family: "region-settlement", levels: ["region"] },
  { id: "city", label: "City", family: "region-settlement", levels: ["region"] },
  { id: "town", label: "Town", family: "region-settlement", levels: ["region"] },
  { id: "village", label: "Village", family: "region-settlement", levels: ["region"] },
  { id: "road", label: "Road", family: "region-infrastructure", levels: ["region"] },
  { id: "bridge", label: "Bridge", family: "region-infrastructure", levels: ["region"] },
  { id: "port", label: "Port", family: "region-infrastructure", levels: ["region"] },
  { id: "landmark", label: "Landmark", family: "region-landmark", levels: ["region"] },
  { id: "tree", label: "Tree", family: "playable-nature", levels: ["playable"] },
  { id: "bush", label: "Bush", family: "playable-nature", levels: ["playable"] },
  { id: "rock", label: "Rock", family: "playable-nature", levels: ["playable"] },
  { id: "house", label: "House", family: "playable-building", levels: ["playable"] },
  { id: "shop", label: "Shop", family: "playable-building", levels: ["playable"] },
  { id: "farm", label: "Farm", family: "playable-building", levels: ["playable"] },
  { id: "barracks", label: "Barracks", family: "playable-building", levels: ["playable"] },
  { id: "wall", label: "Wall", family: "playable-building", levels: ["playable"] },
  { id: "gate", label: "Gate", family: "playable-building", levels: ["playable"] },
  { id: "decoration", label: "Decoration", family: "playable-decoration", levels: ["playable"] },
  { id: "floor", label: "Floor", family: "interior-floor", levels: ["interior"] },
  { id: "interior-wall", label: "Wall", family: "interior-wall", levels: ["interior"] },
  { id: "door", label: "Door", family: "interior-door", levels: ["interior"] },
  { id: "furniture", label: "Furniture", family: "interior-furniture", levels: ["interior"] },
];

const COMMON: MapPaletteSection = {
  id: "navigation",
  label: "Navigation",
  tools: ["select", "pan", "erase"],
};

export function mapEditorLevelKey(
  document: Pick<MapDocument, "mapType" | "playableSpace">,
): MapType | "interior" {
  return document.mapType === "playable" && (document.playableSpace ?? "exterior") === "interior"
    ? "interior"
    : document.mapType;
}

export function isPlayableInterior(document: Pick<MapDocument, "mapType" | "playableSpace">): boolean {
  return mapEditorLevelKey(document) === "interior";
}

export function getMapEditorPalette(
  document: Pick<MapDocument, "mapType" | "playableSpace">,
): MapPaletteSection[] {
  const level = mapEditorLevelKey(document);

  if (level === "world") {
    return [COMMON, { id: "terrain", label: "World Terrain", tools: ["terrain", "stamp"] }];
  }

  if (level === "region") {
    return [
      COMMON,
      { id: "terrain", label: "Region Terrain", tools: ["terrain", "stamp"] },
      { id: "region", label: "Settlements & Infrastructure", tools: ["settlement", "infrastructure"] },
      { id: "nature", label: "Nature Landmarks", tools: ["nature"] },
    ];
  }

  if (level === "interior") {
    return [
      COMMON,
      { id: "interior", label: "Interior", tools: ["floor", "wall", "door", "furniture"] },
      { id: "gameplay", label: "Gameplay", tools: ["gameplay", "collision"] },
    ];
  }

  return [
    COMMON,
    { id: "terrain", label: "Playable Terrain", tools: ["terrain", "stamp"] },
    { id: "nature", label: "Nature & Decoration", tools: ["nature", "decoration"] },
    { id: "buildings", label: "Buildings", tools: ["building"] },
    { id: "gameplay", label: "Gameplay", tools: ["gameplay", "collision"] },
  ];
}

export function getMapAssetsForLevel(
  document: Pick<MapDocument, "mapType" | "playableSpace">,
  catalog: readonly MapAssetDefinition[] = MAP_ASSET_CATALOG,
): MapAssetDefinition[] {
  const level = mapEditorLevelKey(document);
  return catalog.filter(asset => asset.levels.includes(level));
}

export function getMapAssetsByFamily(
  document: Pick<MapDocument, "mapType" | "playableSpace">,
  family: MapAssetFamily,
  catalog: readonly MapAssetDefinition[] = MAP_ASSET_CATALOG,
): MapAssetDefinition[] {
  return getMapAssetsForLevel(document, catalog).filter(asset => asset.family === family);
}

export function isMapAssetAllowed(
  document: Pick<MapDocument, "mapType" | "playableSpace">,
  assetId: string,
  catalog: readonly MapAssetDefinition[] = MAP_ASSET_CATALOG,
): boolean {
  return getMapAssetsForLevel(document, catalog).some(asset => asset.id === assetId || asset.registryId === assetId);
}

export function mapEditorToolIds(
  document: Pick<MapDocument, "mapType" | "playableSpace">,
): MapEditorToolId[] {
  return getMapEditorPalette(document).flatMap(section => section.tools);
}

export function isMapEditorToolAllowed(
  document: Pick<MapDocument, "mapType" | "playableSpace">,
  tool: MapEditorToolId,
): boolean {
  return mapEditorToolIds(document).includes(tool);
}
