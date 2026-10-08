import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  DirectModelProvider,
  GitHubHttpRepositoryAdapter,
  ProjectDocumentationAdapter,
  RepositoryCodeGraphAdapter,
  PersistentWebAiSessionStore,
  createSupabaseAssetRegistryAdapter,
  createProjectTools,
  createToolRouter,
  createVendrithAgentOrchestrator,
  consumeWebAiRequestBudget,
  requestBodyExceedsWebAiLimit,
} from "../../../ai";
import { resolveAuthoritativeMap } from "../../../editor/map-authoritative-resolver";

export const runtime = "nodejs";
const MAX_PROMPT_LENGTH = 4000;

function createRepository() {
  return new GitHubHttpRepositoryAdapter({
    owner: process.env.VENDRITH_GITHUB_OWNER ?? "rakarakaa775",
    repository: process.env.VENDRITH_GITHUB_REPOSITORY ?? "World-of-vendrith",
    ref: process.env.VENDRITH_GITHUB_REF ?? "feat/vendrith-ecc-v1",
  });
}

function createSupabase(accessToken?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ojtmfokjcirvjvhnbnos.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_DIe0amy6Q4qVXV6srZTCRQ_DHe6NANN";
  return createClient(url, key, accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : undefined);
}

function createVerification(repository: GitHubHttpRepositoryAdapter) {
  return {
    async verify(scope: string[]) {
      const checks = await Promise.all(scope.map(async item => {
        const matches = await repository.search(item);
        return { name: `repository-search:${item}`, ok: matches.length > 0, detail: `${matches.length} matching files` };
      }));
      return { ok: checks.every(check => check.ok), checks };
    },
  };
}

function createMapInspector(client: ReturnType<typeof createSupabase>) {
  return {
    async resolveMap(mapId: string) {
      try {
        const resolved = await resolveAuthoritativeMap(client, mapId);
        const document = resolved.document;
        return {
          version: resolved.version,
          source: "supabase:map_editor_load_identity_snapshot_v1",
          document: {
            id: document.id,
            name: document.name,
            mapType: document.mapType,
            parentMapId: document.parentMapId,
            width: document.width,
            height: document.height,
            tileSize: document.tileSize,
            playableSpace: document.playableSpace,
            parentPlayableMapId: document.parentPlayableMapId,
            layers: document.layers.map(layer => ({
              id: layer.id,
              name: layer.name,
              kind: layer.kind,
              visible: layer.visible,
              cells: layer.cells.map(cell => ({ tileId: cell.tileId })),
              objects: layer.objects.map(object => ({
                id: object.id,
                kind: object.kind,
                category: object.category,
                x: object.x,
                y: object.y,
                width: object.width,
                height: object.height,
                assetId: object.assetId,
                assetName: object.assetName,
                playableMapId: object.playableMapId,
                childMapId: object.childMapId,
                interiorMapId: object.interiorMapId,
              })),
            })),
          },
        };
      } catch {
        return null;
      }
    },
  };
}

function createOrchestrator(accessToken: string) {
  const repository = createRepository();
  const documentation = new ProjectDocumentationAdapter(repository);
  const codeIntelligence = new RepositoryCodeGraphAdapter(repository);
  const supabase = createSupabase(accessToken);
  const assetRegistry = createSupabaseAssetRegistryAdapter(supabase);
  const tools = createProjectTools({
    repository,
    documentation,
    codeIntelligence,
    assetRegistry,
    verification: createVerification(repository),
    mapInspector: createMapInspector(supabase),
  });
  return createVendrithAgentOrchestrator({
    modelProvider: new DirectModelProvider(),
    toolRouter: createToolRouter(tools),
  });
}

async function authenticate(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return null;

  const authSupabase = createSupabase();
  const { data, error } = await authSupabase.auth.getUser(token);
  if (error || !data.user || data.user.is_anonymous) return null;
  return { token, user: data.user };
}

export async function GET(request: Request) {
  try {
    const auth = await authenticate(request);
    if (!auth) return NextResponse.json({ error: "Invalid or expired authentication session." }, { status: 401 });

    const sessionId = new URL(request.url).searchParams.get("sessionId");
    if (!sessionId) return NextResponse.json({ error: "sessionId is required." }, { status: 400 });

    const store = new PersistentWebAiSessionStore(createSupabase(auth.token), auth.user.id);
    const session = await store.getSession(sessionId);
    if (!session) return NextResponse.json({ error: "AI session not found." }, { status: 404 });

    const messages = await store.loadHistory(session.id);
    return NextResponse.json({ session, messages });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load Vendrith AI session." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticate(request);
    if (!auth) return NextResponse.json({ error: "Invalid or expired authentication session." }, { status: 401 });

    if (requestBodyExceedsWebAiLimit(request.headers.get("content-length"))) {
      return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
    }

    const rateLimit = consumeWebAiRequestBudget(auth.user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Web AI request rate limit exceeded.", retryAfterSeconds: rateLimit.retryAfterSeconds },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }

    const body = await request.json() as {
      prompt?: string;
      mode?: "explain" | "plan" | "execute" | "high-risk";
      sessionId?: string;
      title?: string;
      context?: { type: "world" | "region" | "playable"; id: string };
      proposalId?: string;
      approve?: boolean;
    };
    if (body.approve === true && body.proposalId) {
      const supabase = createSupabase(auth.token);
      const { data, error } = await supabase.rpc("approve_vendrith_creator_action_v1", {
        p_proposal_id: body.proposalId,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      if (data?.ok === true) {
        const queued = await supabase.rpc("enqueue_vendrith_runtime_intent_v1", {
          p_proposal_id: body.proposalId,
        });
        if (queued.error) return NextResponse.json({ error: queued.error.message }, { status: 500 });
        return NextResponse.json({ ...data, runtimeIntent: queued.data });
      }
      return NextResponse.json(data);
    }

    const prompt = body.prompt?.trim();
    if (!prompt) return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    if (prompt.length > MAX_PROMPT_LENGTH) return NextResponse.json({ error: `Prompt is too long (maximum ${MAX_PROMPT_LENGTH} characters).` }, { status: 413 });

    const mode = body.mode ?? "explain";
    if (mode === "execute" || mode === "high-risk") {
      return NextResponse.json({ error: "Creator mutation requires an explicit persisted approval; use mode=plan to create a proposal." }, { status: 403 });
    }
    if (mode !== "explain" && mode !== "plan") {
      return NextResponse.json({ error: "Unsupported Web/Creator AI mode." }, { status: 400 });
    }

    const supabase = createSupabase(auth.token);
    const store = new PersistentWebAiSessionStore(supabase, auth.user.id);
    const requestedContext = body.context && typeof body.context === "object"
      ? body.context
      : undefined;
    if (requestedContext && (!["world", "region", "playable"].includes(requestedContext.type) || typeof requestedContext.id !== "string" || requestedContext.id.length > 128)) {
      return NextResponse.json({ error: "Invalid world context." }, { status: 400 });
    }

    const session = body.sessionId
      ? await store.getSession(body.sessionId)
      : await store.createSession(body.title, requestedContext);
    if (!session) return NextResponse.json({ error: "AI session not found." }, { status: 404 });
    if (session.status !== "active") return NextResponse.json({ error: "AI session is archived." }, { status: 409 });

    const context = session.contextId && session.contextType
      ? { type: session.contextType, id: session.contextId }
      : undefined;

    if (context) {
      const expectedType = context.type === "world" ? "world" : context.type === "region" ? "region" : "playable";
      await resolveAuthoritativeMap(supabase, context.id, expectedType);
    }

    const history = await store.loadHistory(session.id);
    await store.appendMessage(session.id, "user", prompt);

    const result = await createOrchestrator(auth.token).run({
      id: crypto.randomUUID(),
      mode,
      prompt,
      conversation: history.map(item => ({ role: item.role, content: item.content })),
      audience: "web-creator",
      worldContext: context,
    });

    const assistantMessage = await store.appendMessage(session.id, "assistant", result.response.content);

    let proposalId: string | null = null;
    const approvalPayload = result.approval as unknown as { required?: boolean; action?: { operation?: string; mapId?: string; [key: string]: unknown } };
    if (mode === "plan" && context?.type === "playable" && approvalPayload.required === true) {
      const proposedAction = approvalPayload.action;
      const operation = proposedAction?.operation;
      const mapId = proposedAction?.mapId;
      if (operation && ["create", "move", "rotate", "scale", "delete"].includes(operation) && typeof mapId === "string" && mapId === (context.type === "playable" ? context.id : mapId)) {
        const { data: proposal, error: proposalError } = await supabase
          .from("vendrith_creator_action_proposals")
          .insert({
            user_id: auth.user.id,
            session_id: session.id,
            context_type: context.type,
            context_id: context.id,
            map_id: mapId,
            operation,
            action: proposedAction,
            rationale: result.response.content.slice(0, 4000),
          })
          .select("id")
          .single();
        if (proposalError) return NextResponse.json({ error: proposalError.message }, { status: 500 });
        proposalId = proposal.id;
      }
    }

    return NextResponse.json({
      sessionId: session.id,
      proposalId,
      response: assistantMessage.content,
      model: result.response.model,
      provider: result.response.provider,
      iterations: result.iterations,
      approval: result.approval,
      evidence: result.evidence,
      toolResults: result.toolResults.map(item => ({ id: item.id, name: item.name, ok: item.ok, error: item.error })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Vendrith AI request failed." }, { status: 500 });
  }
}
