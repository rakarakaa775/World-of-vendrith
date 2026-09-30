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

function contentTypeFor(path: string) {
  const lower = path.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "application/octet-stream";
}

async function sha256Hex(bytes: Uint8Array) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Supabase server environment is incomplete" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  let paths = DEFAULT_PATHS;

  try {
    const body = await req.json();
    if (Array.isArray(body?.paths) && body.paths.length) {
      paths = body.paths.filter(
        (path: unknown): path is string =>
          typeof path === "string" && path.length > 0 && !path.includes("..") && !path.startsWith("/"),
      );
    }
  } catch {}

  const results: Array<Record<string, unknown>> = [];

  for (const assetPath of paths) {
    const upstream =
      `https://media.githubusercontent.com/media/${REPO}/${REF}/${assetPath.split("/").map(encodeURIComponent).join("/")}`;

    try {
      const response = await fetch(upstream, { redirect: "follow" });
      if (!response.ok) throw new Error(`GitHub LFS HTTP ${response.status}`);

      const contentType = contentTypeFor(assetPath);
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (!bytes.length) throw new Error("empty asset");

      const upstreamType = response.headers.get("content-type") || "";
      if (upstreamType.includes("text/plain") || contentType === "application/octet-stream") {
        const text = new TextDecoder().decode(bytes);
        if (text.startsWith("version https://git-lfs.github.com/spec/v1")) {
          throw new Error("GitHub returned an LFS pointer instead of the binary asset");
        }
      }

      const sha256 = await sha256Hex(bytes);
      const storagePath = `assets/${sha256}`;

      const { data: fileRows, error: fileLookupError } = await admin
        .from("asset_files")
        .select("id,asset_id,file_path,file_name,byte_size,sha256,verification_status,storage_bucket,storage_path")
        .eq("file_path", assetPath);

      if (fileLookupError) throw fileLookupError;
      if (!fileRows?.length) throw new Error("asset_files record not found for source path");

      const conflictingHash = fileRows.find((row) => row.sha256 && row.sha256 !== sha256);
      if (conflictingHash) {
        throw new Error(`SHA-256 mismatch against asset_files: expected ${conflictingHash.sha256}, got ${sha256}`);
      }

      const conflictingSize = fileRows.find(
        (row) => row.byte_size !== null && Number(row.byte_size) !== bytes.byteLength,
      );
      if (conflictingSize) {
        throw new Error(
          `byte size mismatch against asset_files: expected ${conflictingSize.byte_size}, got ${bytes.byteLength}`,
        );
      }

      const { data: existing, error: existingError } = await admin.storage.from(BUCKET).download(storagePath);
      if (existingError && !existingError.message.toLowerCase().includes("not found")) {
        throw existingError;
      }

      if (!existing) {
        const { error: uploadError } = await admin.storage.from(BUCKET).upload(storagePath, bytes, {
          contentType,
          cacheControl: "31536000",
          upsert: false,
        });
        if (uploadError && !uploadError.message.toLowerCase().includes("already exists")) {
          throw uploadError;
        }
      }

      const { data: stored, error: storedError } = await admin.storage.from(BUCKET).download(storagePath);
      if (storedError || !stored) {
        throw storedError || new Error("canonical storage object could not be downloaded after upload");
      }

      const storedBytes = new Uint8Array(await stored.arrayBuffer());
      const storedSha256 = await sha256Hex(storedBytes);
      if (storedSha256 !== sha256) {
        throw new Error(`Storage verification failed: expected ${sha256}, got ${storedSha256}`);
      }

      const { error: bindError } = await admin
        .from("asset_files")
        .update({
          storage_bucket: BUCKET,
          storage_path: storagePath,
          sha256,
          byte_size: bytes.byteLength,
          verification_status: "verified",
          verification_method: "canonical_storage_sha256",
        })
        .eq("file_path", assetPath);

      if (bindError) throw bindError;

      results.push({
        path: assetPath,
        asset_ids: fileRows.map((row) => row.asset_id),
        status: existing ? "verified_existing" : "uploaded_verified",
        bytes: bytes.byteLength,
        sha256,
        storage_bucket: BUCKET,
        storage_path: storagePath,
      });
    } catch (error) {
      results.push({
        path: assetPath,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const failed = results.filter((result) => result.status === "failed");
  return new Response(JSON.stringify({ bucket: BUCKET, results, ok: failed.length === 0 }), {
    status: failed.length ? 207 : 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});