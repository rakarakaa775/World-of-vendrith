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

function getApiKey(options: VercelAiGatewayOptions): string {
  const key = options.apiKey ?? process.env.AI_GATEWAY_API_KEY ?? process.env.VERCEL_OIDC_TOKEN;
  if (!key) throw new Error("AI Gateway authentication is not configured.");
  return key;
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
    const response = await fetch(`${this.options.baseUrl ?? "https://ai-gateway.vercel.sh/v1"}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getApiKey(this.options)}`, "Content-Type": "application/json" },
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
