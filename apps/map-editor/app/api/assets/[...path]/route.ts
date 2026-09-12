import { NextRequest } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

const ASSET_REPO = "rakarakaa775/Asset-library-LPC";
const ASSET_REF = "main";

const LOCAL_TERRAIN_FILES: Record<string, { fileName: string; contentType: string }> = {
  "tile_grass.png": { fileName: "tile_grass.png", contentType: "image/png" },
  "tile_dirt.png": { fileName: "tile_dirt.png", contentType: "image/png" },
  "tile_pavement.png": { fileName: "tile_pavement.png", contentType: "image/png" },
};

export async function GET(_request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await context.params;
  const assetPath = segments.map((segment) => decodeURIComponent(segment)).join("/");
  if (!assetPath || assetPath.includes("..")) {
    return new Response("Invalid asset path", { status: 400 });
  }

  const localMatch = assetPath.startsWith("local/")
    ? LOCAL_TERRAIN_FILES[assetPath.slice("local/".length)]
    : undefined;

  if (localMatch) {
    try {
      // The Vercel project root is apps/map-editor, so these files are bundled
      // alongside package.json at deploy time. Keep the allowlist above strict
      // so this route can never become an arbitrary filesystem reader.
      const file = await fs.readFile(path.join(process.cwd(), localMatch.fileName));
      return new Response(file, {
        status: 200,
        headers: {
          "Content-Type": localMatch.contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (error) {
      console.error("Bundled terrain asset failed to read", localMatch.fileName, error);
      return new Response("Bundled terrain asset not found", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }
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
