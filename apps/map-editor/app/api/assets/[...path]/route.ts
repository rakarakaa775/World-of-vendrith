import { NextRequest } from "next/server";

const ASSET_REPO = "rakarakaa775/Asset-library-LPC";
const ASSET_REF = "main";

export async function GET(_request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const assetPath = path.map((segment) => decodeURIComponent(segment)).join("/");
  if (!assetPath || assetPath.includes("..")) {
    return new Response("Invalid asset path", { status: 400 });
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
