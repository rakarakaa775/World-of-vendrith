import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  DirectModelProvider,
  GitHubHttpRepositoryAdapter,
  ProjectDocumentationAdapter,
  RepositoryCodeGraphAdapter,
  createProjectTools,
  createRepositoryDevelopmentWorkflowProvider,
  createToolRouter,
  createVendrithAgentOrchestrator,
} from "../../../ai";

export const runtime = "nodejs";
const MAX_PROMPT_LENGTH = 4000;

function createSupabase(accessToken?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase environment is not configured.");
  return createClient(url, key, accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : undefined);
}

function createRepository() {
  return new GitHubHttpRepositoryAdapter({
    owner: process.env.VENDRITH_GITHUB_OWNER ?? "rakarakaa775",
    repository: process.env.VENDRITH_GITHUB_REPOSITORY ?? "World-of-vendrith",
    ref: process.env.VENDRITH_GITHUB_REF ?? "feat/vendrith-ecc-v1",
  });
}

async function authenticate(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return null;
  const supabase = createSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user || data.user.is_anonymous) return null;
  return { token, user: data.user };
}

function createDevelopmentOrchestrator(accessToken: string) {
  const repository = createRepository();
  const documentation = new ProjectDocumentationAdapter(repository);
  const codeIntelligence = new RepositoryCodeGraphAdapter(repository);
  const supabase = createSupabase(accessToken);
  const workflow = createRepositoryDevelopmentWorkflowProvider({
    repository,
    codeIntelligence,
    verification: {
      async verify(scope: string[]) {
        const checks = await Promise.all(scope.map(async item => {
          const matches = await repository.search(item);
          return { name: `repository-search:${item}`, ok: matches.length > 0, detail: `${matches.length} matching files` };
        }));
        return { ok: checks.every(check => check.ok), checks };
      },
    },
  });
  const tools = createProjectTools({
    repository,
    documentation,
    codeIntelligence,
    assetRegistry: {
      async search() { return []; },
    },
    verification: {
      async verify(scope: string[]) {
        const checks = await Promise.all(scope.map(async item => {
          const matches = await repository.search(item);
          return { name: `repository-search:${item}`, ok: matches.length > 0, detail: `${matches.length} matching files` };
        }));
        return { ok: checks.every(check => check.ok), checks };
      },
    },
    developmentWorkflow: workflow,
  });
  return createVendrithAgentOrchestrator({
    modelProvider: new DirectModelProvider(),
    toolRouter: createToolRouter(tools),
  });
}

export async function POST(request: Request) {
  try {
    const auth = await authenticate(request);
    if (!auth) return NextResponse.json({ error: "Invalid or expired authentication session." }, { status: 401 });

    const body = await request.json() as { prompt?: string; mode?: "explain" | "plan" | "execute" | "high-risk" };
    const prompt = body.prompt?.trim();
    if (!prompt) return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    if (prompt.length > MAX_PROMPT_LENGTH) return NextResponse.json({ error: `Prompt is too long (maximum ${MAX_PROMPT_LENGTH} characters).` }, { status: 413 });

    const mode = body.mode ?? "explain";
    if (mode === "execute" || mode === "high-risk") {
      return NextResponse.json({
        error: "Development mutation requires the Phase 4.6 approved ECC/Agent Skills execution workflow. No repository mutation is exposed by this endpoint yet.",
        code: "DEVELOPMENT_MUTATION_WORKFLOW_NOT_CONNECTED",
      }, { status: 403 });
    }

    const result = await createDevelopmentOrchestrator(auth.token).run({
      id: crypto.randomUUID(),
      mode,
      prompt,
      audience: "development",
    });

    return NextResponse.json({
      audience: "development",
      response: result.response,
      approval: result.approval,
      iterations: result.iterations,
      evidence: result.evidence,
      toolResults: result.toolResults.map(item => ({ id: item.id, name: item.name, ok: item.ok, error: item.error })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Vendrith Development AI request failed." }, { status: 500 });
  }
}
