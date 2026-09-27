import { NextRequest } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

const ASSET_REPOS = {
  library: "rakarakaa775/Asset-library-LPC",
  world: "rakarakaa775/World-of-vendrith",
} as const;
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

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await context.params;
  const requestedRepo = request.nextUrl.searchParams.get("repo") === "world" ? "world" : "library";
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

  const upstreamPath =
    requestedRepo === "world"
      ? `assets/world/world/${assetPath.replace(/^ASSET_LIBRARY\\//, "")}`
      : assetPath.replace(/^ASSET_LIBRARY\\//, "ASSET_LIBRARY/");

  const upstream = `https://raw.githubusercontent.com/${ASSET_REPOS[requestedRepo]}/${ASSET_REF}/${upstreamPath
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

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("text/plain")) {
      const body = await response.arrayBuffer();
      return new Response(body, {
        status: 200,
        headers: {
          "Content-Type": contentType || "application/octet-stream",
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }

    const pointer = await response.text();
    const oidMatch = pointer.match(/^oid sha256:([a-f0-9]{64})$/m);
    const sizeMatch = pointer.match(/^size (\\d+)$/m);

    if (!pointer.startsWith("version https://git-lfs.github.com/spec/v1") || !oidMatch || !sizeMatch) {
      return new Response(pointer, {
        status: 200,
        headers: {
          "Content-Type": contentType || "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }

    const batchUrl = `https://github.com/${ASSET_REPOS[requestedRepo]}.git/info/lfs/objects/batch`;
    const batchResponse = await fetch(batchUrl, {
      method: "POST",
      headers: {
        Accept: "application/vnd.git-lfs+json",
        "Content-Type": "application/vnd.git-lfs+json",
      },
      body: JSON.stringify({
        operation: "download",
        transfers: ["basic"],
        ref: { name: `refs/heads/${ASSET_REF}` },
        objects: [{ oid: oidMatch[1], size: Number(sizeMatch[1]) }],
        hash_algo: "sha256",
      }),
      cache: "no-store",
    });

    if (!batchResponse.ok) {
      return new Response(`Git LFS batch failed: ${batchResponse.status}`, {
        status: batchResponse.status,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const batch = (await batchResponse.json()) as {
      objects?: Array<{
        error?: { code?: number; message?: string };
        actions?: { download?: { href?: string; header?: Record<string, string> } };
      }>;
    };
    const object = batch.objects?.[0];
    if (object?.error) {
      return new Response(`Git LFS object failed: ${object.error.message || object.error.code || "unknown error"}`, {
        status: object.error.code || 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const download = object?.actions?.download;
    if (!download?.href) {
      return new Response("Git LFS download action missing", {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const assetResponse = await fetch(download.href, {
      headers: download.header || {},
      cache: "force-cache",
      next: { revalidate: 86400 },
    });
    if (!assetResponse.ok) {
      return new Response(`Git LFS download failed: ${assetResponse.status}`, {
        status: assetResponse.status,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const body = await assetResponse.arrayBuffer();
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": assetResponse.headers.get("content-type") || "application/octet-stream",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Map editor asset proxy failed", error);
    return new Response("Asset proxy failed", { status: 502 });
  }
}
