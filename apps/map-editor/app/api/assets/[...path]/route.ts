import { NextRequest } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

const ASSET_REPO = "rakarakaa775/Asset-library-LPC";
const ASSET_REF = "main";

type LocalTerrainFile = { relativePath: string; contentType: string };

const LOCAL_TERRAIN_FILES: Record<string, LocalTerrainFile> = {
  "tile_grass.png": { relativePath: "public/assets/terrain/tile_grass.png", contentType: "image/png" },
  "tile_sand.png": { relativePath: "public/assets/terrain/tile_sand.png", contentType: "image/png" },
  "tile_dirt.png": { relativePath: "public/assets/terrain/tile_dirt.png", contentType: "image/png" },
  "tile_pavement.png": { relativePath: "public/assets/terrain/tile_pavement.png", contentType: "image/png" },
  "tile_water.png": { relativePath: "public/assets/terrain/tile_water.png", contentType: "image/png" },
};

const LEGACY_TERRAIN_FILES: Record<string, LocalTerrainFile> = {
  "tile_grass.png": { relativePath: "tile_grass.png", contentType: "image/png" },
  "tile_sand.png": { relativePath: "tile_sand.png", contentType: "image/png" },
  "tile_dirt.png": { relativePath: "tile_dirt.png", contentType: "image/png" },
  "tile_pavement.png": { relativePath: "tile_pavement.png", contentType: "image/png" },
  "tile_water.png": { relativePath: "tile_water.png", contentType: "image/png" },
};

async function readBundledTerrain(fileName: string): Promise<{ body: Buffer; source: string; contentType: string } | null> {
  const candidates = [LOCAL_TERRAIN_FILES[fileName], LEGACY_TERRAIN_FILES[fileName]].filter(Boolean);
  for (const candidate of candidates) {
    try {
      const absolutePath = path.join(process.cwd(), candidate.relativePath);
      const body = await fs.readFile(absolutePath);
      return { body, source: candidate.relativePath, contentType: candidate.contentType };
    } catch {
      // Try the next canonical/legacy location. The allowlist prevents arbitrary reads.
    }
  }
  return null;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await context.params;
  const assetPath = segments.map((segment) => decodeURIComponent(segment)).join("/");
  if (!assetPath || assetPath.includes("..")) {
    return new Response("Invalid asset path", { status: 400 });
  }

  const localFileName = assetPath.startsWith("local/") ? assetPath.slice("local/".length) : null;
  if (localFileName && LOCAL_TERRAIN_FILES[localFileName]) {
    const bundled = await readBundledTerrain(localFileName);
    if (bundled) {
      return new Response(new Uint8Array(bundled.body), {
        status: 200,
        headers: {
          "Content-Type": bundled.contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Vandrith-Asset-Source": bundled.source,
        },
      });
    }
    return new Response("Bundled terrain asset not found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const upstream = `https://media.githubusercontent.com/media/${ASSET_REPO}/${ASSET_REF}/raw/${assetPath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

  try {
    const response = await fetch(upstream, {
      cache: "force-cache",
      next: { revalidate: 86400 },
    });
    if (!response.ok) {
      return new Response(`Asset upstream failed: ${response.status}`, {
        status: response.status,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const body = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Map editor asset proxy failed", error);
    return new Response("Asset proxy failed", { status: 502 });
  }
}
