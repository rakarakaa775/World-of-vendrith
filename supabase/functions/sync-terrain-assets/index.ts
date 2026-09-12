import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const BUCKET = "vandrith-assets";
const REPO = "rakarakaa775/Asset-library-LPC";
const REF = "main";
const DEFAULT_PATHS = [
  "ASSET_LIBRARY/02_TILES_AND_TERRAIN/TopDown_RPG_Mockup/tile_grass.png",
  "ASSET_LIBRARY/02_TILES_AND_TERRAIN/TopDown_RPG_Mockup/tile_dirt.png",
  "ASSET_LIBRARY/02_TILES_AND_TERRAIN/TopDown_RPG_Mockup/tile_pavement.png",
];

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Supabase server environment is incomplete" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  let paths = DEFAULT_PATHS;
  try {
    const body = await req.json();
    if (Array.isArray(body?.paths) && body.paths.length) paths = body.paths.filter((p: unknown) => typeof p === "string" && !p.includes(".."));
  } catch {}

  const results: Array<Record<string, unknown>> = [];
  for (const assetPath of paths) {
    const upstream = `https://media.githubusercontent.com/media/${REPO}/${REF}/raw/${assetPath.split("/").map(encodeURIComponent).join("/")}`;
    try {
      const response = await fetch(upstream, { redirect: "follow" });
      if (!response.ok) throw new Error(`GitHub LFS HTTP ${response.status}`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (!bytes.length) throw new Error("empty asset");
      const { error } = await admin.storage.from(BUCKET).upload(assetPath, bytes, {
        contentType: "image/png",
        cacheControl: "31536000",
        upsert: true,
      });
      if (error) throw error;
      results.push({ path: assetPath, status: "uploaded", bytes: bytes.byteLength });
    } catch (error) {
      results.push({ path: assetPath, status: "failed", error: error instanceof Error ? error.message : String(error) });
    }
  }

  const failed = results.filter((r) => r.status === "failed");
  return new Response(JSON.stringify({ bucket: BUCKET, results, ok: failed.length === 0 }), {
    status: failed.length ? 207 : 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
