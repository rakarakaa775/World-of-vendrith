import type { MapDocument, MapType, PlayableSpaceType } from "./map-document";

export type MapEditorToolId =
  | "select"
  | "pan"
  | "terrain"
  | "stamp"
  | "erase"
  | "settlement"
  | "infrastructure"
  | "nature"
  | "building"
  | "decoration"
  | "gameplay"
  | "collision"
  | "floor"
  | "wall"
  | "door"
  | "furniture";

export type MapPaletteSectionId =
  | "navigation"
  | "terrain"
  | "region"
  | "nature"
  | "buildings"
  | "interior"
  | "gameplay";

export type MapPaletteSection = {
  id: MapPaletteSectionId;
  label: string;
  tools: MapEditorToolId[];
};

const COMMON: MapPaletteSection = {
  id: "navigation",
  label: "Navigation",
  tools: ["select", "pan", "erase"],
};

export function getMapEditorPalette(document: Pick<MapDocument, "mapType" | "playableSpace">): MapPaletteSection[] {
  const sections: MapPaletteSection[] = [COMMON];

  if (document.mapType === "world") {
    return [
      ...sections,
      { id: "terrain", label: "World Terrain", tools: ["terrain", "stamp"] },
    ];
  }

  if (document.mapType === "region") {
    return [
      ...sections,
      { id: "terrain", label: "Region Terrain", tools: ["terrain", "stamp"] },
      { id: "region", label: "Settlements & Infrastructure", tools: ["settlement", "infrastructure"] },
      { id: "nature", label: "Nature Landmarks", tools: ["nature"] },
    ];
  }

  if ((document.playableSpace ?? "exterior") === "interior") {
    return [
      ...sections,
      { id: "interior", label: "Interior", tools: ["floor", "wall", "door", "furniture"] },
      { id: "gameplay", label: "Gameplay", tools: ["gameplay", "collision"] },
    ];
  }

  return [
    ...sections,
    { id: "terrain", label: "Playable Terrain", tools: ["terrain", "stamp"] },
    { id: "buildings", label: "Buildings", tools: ["building", "decoration", "nature"] },
    { id: "gameplay", label: "Gameplay", tools: ["gameplay", "collision"] },
  ];
}

export function mapEditorToolIds(document: Pick<MapDocument, "mapType" | "playableSpace">): MapEditorToolId[] {
  return getMapEditorPalette(document).flatMap(section => section.tools);
}

export function isMapEditorToolAllowed(
  document: Pick<MapDocument, "mapType" | "playableSpace">,
  tool: MapEditorToolId,
): boolean {
  return mapEditorToolIds(document).includes(tool);
}

export function mapEditorLevelKey(
  document: Pick<MapDocument, "mapType" | "playableSpace">,
): MapType | "interior" {
  return document.mapType === "playable" && (document.playableSpace ?? "exterior") === "interior"
    ? "interior"
    : document.mapType;
}

export function isPlayableInterior(document: Pick<MapDocument, "mapType" | "playableSpace">): boolean {
  return document.mapType === "playable" && (document.playableSpace ?? "exterior") === "interior";
}
