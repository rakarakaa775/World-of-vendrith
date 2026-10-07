import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GitHubHttpRepositoryAdapter, ProjectDocumentationAdapter, RepositoryCodeGraphAdapter, VercelAiGatewayModelProvider, createSupabaseAssetRegistryAdapter, createProjectTools, createToolRouter, createVendrithAgentOrchestrator } from "../../../ai";
import { resolveAuthoritativeMap } from "../../../editor/map-authoritative-resolver";

export const runtime = "nodejs";
const MAX_PROMPT_LENGTH = 4000;
const MAX_HISTORY_MESSAGES = 12;
const MAX_HISTORY_MESSAGE_LENGTH = 4000;

function createRepository() {
  return new GitHubHttpRepositoryAdapter({ owner: process.env.VENDRITH_GITHUB_OWNER ?? "rakarakaa775", repository: process.env.VENDRITH_GITHUB_REPOSITORY ?? "World-of-vendrith", ref: process.env.VENDRITH_GITHUB_REF ?? "feat/vendrith-ecc-v1" });
}
function createSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ojtmfokjcirvjvhnbnos.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_DIe0amy6Q4qVXV6srZTCRQ_DHe6NANN";
  return createClient(url, key);
}
function createVerification(repository: GitHubHttpRepositoryAdapter) {
  return { async verify(scope: string[]) { const checks = await Promise.all(scope.map(async item => { const matches = await repository.search(item); return { name: `repository-search:${item}`, ok: matches.length > 0, detail: `${matches.length} matching files` }; })); return { ok: checks.every(check => check.ok), checks }; } };
}
function createMapInspector(client: ReturnType<typeof createSupabase>) {
  return { async resolveMap(mapId: string) { try {
    const resolved = await resolveAuthoritativeMap(client, mapId);
    const document = resolved.document;
    return { version: resolved.version, source: "supabase:map_editor_load_identity_snapshot_v1", document: {
      id: document.id, name: document.name, mapType: document.mapType, parentMapId: document.parentMapId, width: document.width, height: document.height, tileSize: document.tileSize,
      playableSpace: document.playableSpace, parentPlayableMapId: document.parentPlayableMapId,
      layers: document.layers.map(layer => ({ id: layer.id, name: layer.name, kind: layer.kind, visible: layer.visible, cells: layer.cells.map(cell => ({ tileId: cell.tileId })), objects: layer.objects.map(object => ({ id: object.id, kind: object.kind, category: object.category, x: object.x, y: object.y, width: object.width, height: object.height, assetId: object.assetId, assetName: object.assetName, playableMapId: object.playableMapId, childMapId: object.childMapId, interiorMapId: object.interiorMapId })) }))
    } };
  } catch { return null; } } };
}
function parseConversation(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(-MAX_HISTORY_MESSAGES)
    .filter((item): item is { role: "user" | "assistant"; content: string } => typeof item === "object" && item !== null && (((item as any).role === "user") || ((item as any).role === "assistant")) && typeof (item as any).content === "string")
    .map(item => ({ role: item.role, content: item.content.trim().slice(0, MAX_HISTORY_MESSAGE_LENGTH) }))
    .filter(item => item.content.length > 0);
}
function createOrchestrator() {
  const repository = createRepository();
  const documentation = new ProjectDocumentationAdapter(repository);
  const codeIntelligence = new RepositoryCodeGraphAdapter(repository);
  const supabase = createSupabase();
  const assetRegistry = createSupabaseAssetRegistryAdapter(supabase);
  const tools = createProjectTools({ repository, documentation, codeIntelligence, assetRegistry, verification: createVerification(repository), mapInspector: createMapInspector(supabase) });
  return createVendrithAgentOrchestrator({ modelProvider: new VercelAiGatewayModelProvider(), toolRouter: createToolRouter(tools) });
}
export async function POST(request: Request) {
  try {
    const body = await request.json() as { prompt?: string; mode?: "explain" | "plan" | "execute" | "high-risk"; conversation?: unknown };
    const prompt = body.prompt?.trim();
    if (!prompt) return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    if (prompt.length > MAX_PROMPT_LENGTH) return NextResponse.json({ error: `Prompt is too long (maximum ${MAX_PROMPT_LENGTH} characters).` }, { status: 413 });
    const mode = body.mode ?? "explain";
    if (mode !== "explain" && mode !== "plan") return NextResponse.json({ error: "The Web/Creator AI endpoint currently exposes read/analyze modes only." }, { status: 403 });
    const result = await createOrchestrator().run({ id: crypto.randomUUID(), mode, prompt, conversation: parseConversation(body.conversation) });
    return NextResponse.json({ response: result.response.content, model: result.response.model, provider: result.response.provider, iterations: result.iterations, approval: result.approval, evidence: result.evidence, toolResults: result.toolResults.map(item => ({ id: item.id, name: item.name, ok: item.ok, error: item.error })) });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Vendrith AI request failed." }, { status: 500 }); }
}
