import { getVercelOidcToken } from "@vercel/oidc";
import type { ModelMessage, ModelProviderPort, ModelRequest, ModelResponse } from "../ports/model-provider";

interface GatewayResponse {
  choices?: Array<{ message?: { content?: string | null; reasoning_content?: string | null; tool_calls?: Array<{ id?: string; function?: { name?: string; arguments?: string | Record<string, unknown> } }> } }>;
  error?: { message?: string };
  model?: string;
}

export interface VercelAiGatewayOptions {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

interface GatewayCredential {
  token: string;
}

async function getGatewayCredential(options: VercelAiGatewayOptions): Promise<GatewayCredential> {
  if (options.apiKey?.trim()) return { token: options.apiKey.trim() };

  const apiKey = process.env.AI_GATEWAY_API_KEY?.trim();
  if (apiKey) return { token: apiKey };

  const oidcToken = process.env.VERCEL_OIDC_TOKEN?.trim();
  if (oidcToken) return { token: oidcToken };

  try {
    const runtimeOidcToken = await getVercelOidcToken();
    if (runtimeOidcToken?.trim()) return { token: runtimeOidcToken.trim() };
  } catch {
    // Local/non-Vercel runtimes may not have an OIDC context; report the normal credential error below.
  }

  throw new Error(
    "AI Gateway authentication is not configured. Set AI_GATEWAY_API_KEY for local/production use, or provide VERCEL_OIDC_TOKEN through Vercel OIDC (for example, run `vercel env pull .env.local` locally). Never put the credential in browser code or Git.",
  );
}

function toGatewayMessages(messages: ModelMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
    ...(message.toolCallId ? { tool_call_id: message.toolCallId } : {}),
    ...(message.toolCalls ? { tool_calls: message.toolCalls.map((call) => ({
      id: call.id, type: "function", function: { name: call.name, arguments: JSON.stringify(call.arguments) },
    })) } : {}),
  }));
}

function parseArguments(value: string | Record<string, unknown> | undefined): Record<string, unknown> {
  if (!value) return {};
  if (typeof value !== "string") return value;
  try { const parsed: unknown = JSON.parse(value); return typeof parsed === "object" && parsed !== null ? parsed as Record<string, unknown> : {}; }
  catch { return {}; }
}

export class VercelAiGatewayModelProvider implements ModelProviderPort {
  constructor(private readonly options: VercelAiGatewayOptions = {}) {}

  async generate(request: ModelRequest): Promise<ModelResponse> {
    const credential = await getGatewayCredential(this.options);
    const baseUrl = this.options.baseUrl ?? process.env.VENDRITH_AI_GATEWAY_BASE_URL ?? "https://ai-gateway.vercel.sh/v1";
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${credential.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.options.model ?? process.env.VENDRITH_AI_MODEL ?? "openai/gpt-5",
        messages: toGatewayMessages(request.messages),
        tools: request.tools?.map((tool) => ({ type: "function", function: { name: tool.name, description: tool.description, parameters: tool.parameters } })),
        tool_choice: request.tools?.length ? "auto" : undefined,
        stream: false,
      }),
    });
    const body = await response.json() as GatewayResponse;
    if (!response.ok) throw new Error(body.error?.message ?? `AI Gateway request failed (${response.status})`);
    const message = body.choices?.[0]?.message;
    if (!message) throw new Error("AI Gateway returned no assistant message.");
    return {
      content: message.content ?? "",
      reasoning: message.reasoning_content ?? undefined,
      toolCalls: (message.tool_calls ?? []).map((call, index) => ({
        id: call.id ?? `tool-${index + 1}`,
        name: call.function?.name ?? "",
        arguments: parseArguments(call.function?.arguments),
      })).filter((call) => call.name.length > 0),
      provider: "vercel-ai-gateway",
      model: body.model ?? this.options.model ?? process.env.VENDRITH_AI_MODEL ?? "openai/gpt-5",
    };
  }
}
