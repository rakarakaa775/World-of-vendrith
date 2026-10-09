import type { ModelMessage, ModelProviderPort, ModelRequest, ModelResponse } from "../ports/model-provider";

interface OpenAiCompatibleResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
      reasoning_content?: string | null;
      tool_calls?: Array<{
        id?: string;
        function?: {
          name?: string;
          arguments?: string | Record<string, unknown>;
        };
      }>;
    };
  }>;
  error?: { message?: string; type?: string; code?: string };
  message?: string;
  model?: string;
}

export interface DirectModelProviderOptions {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  providerName?: string;
}

function resolveApiKey(options: DirectModelProviderOptions): string {
  const key =
    options.apiKey?.trim() ||
    process.env.VENDRITH_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim();

  if (!key) {
    throw new Error(
      "Direct AI provider authentication is not configured. Set VENDRITH_AI_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in the server environment. Never expose the credential to browser code or Git.",
    );
  }

  return key;
}

function toMessages(messages: ModelMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
    ...(message.toolCallId ? { tool_call_id: message.toolCallId } : {}),
    ...(message.toolCalls
      ? {
          tool_calls: message.toolCalls.map((call) => ({
            id: call.id,
            type: "function",
            function: {
              name: call.name,
              arguments: JSON.stringify(call.arguments),
            },
          })),
        }
      : {}),
  }));
}

function parseArguments(value: string | Record<string, unknown> | undefined): Record<string, unknown> {
  if (!value) return {};
  if (typeof value !== "string") return value;

  try {
    const parsed: unknown = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function describeProviderError(status: number, bodyText: string): string {
  let body: OpenAiCompatibleResponse | undefined;
  try {
    body = JSON.parse(bodyText) as OpenAiCompatibleResponse;
  } catch {
    // Some proxies/providers return a plain-text error instead of JSON.
  }

  const detail = body?.error?.message ?? body?.message;
  const code = body?.error?.code ?? body?.error?.type;
  const safeDetail = typeof detail === "string" ? detail.trim().slice(0, 1200) : "";
  const safeCode = typeof code === "string" ? code.trim().slice(0, 120) : "";
  const suffix = [safeCode, safeDetail].filter(Boolean).join(": ");

  return `Direct AI provider request failed (HTTP ${status})${suffix ? `: ${suffix}` : bodyText.trim() ? `: ${bodyText.trim().slice(0, 600)}` : ". Provider returned an empty error response."}`;
}

/**
 * Direct OpenAI-compatible model provider.
 *
 * This bypasses Vercel AI Gateway and talks directly to the configured
 * provider endpoint. The adapter remains replaceable through ModelProviderPort.
 */
export class DirectModelProvider implements ModelProviderPort {
  constructor(private readonly options: DirectModelProviderOptions = {}) {}

  async generate(request: ModelRequest): Promise<ModelResponse> {
    const apiKey = resolveApiKey(this.options);
    const isGemini = Boolean(process.env.GEMINI_API_KEY?.trim()) && !process.env.OPENAI_API_KEY?.trim() && !process.env.VENDRITH_AI_API_KEY?.trim();
    const baseUrl =
      this.options.baseUrl ??
      process.env.VENDRITH_AI_BASE_URL ??
      (isGemini ? "https://generativelanguage.googleapis.com/v1beta/openai" : "https://api.openai.com/v1");
    const model =
      this.options.model ??
      process.env.VENDRITH_AI_MODEL ??
      (isGemini ? "gemini-3.6-flash" : "gpt-5");

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: toMessages(request.messages),
        tools: request.tools?.map((tool) => ({
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        })),
        tool_choice: request.tools?.length ? "auto" : undefined,
        stream: false,
      }),
    });

    const responseText = await response.text();
    let body: OpenAiCompatibleResponse;
    try {
      body = JSON.parse(responseText) as OpenAiCompatibleResponse;
    } catch {
      if (!response.ok) {
        throw new Error(describeProviderError(response.status, responseText));
      }
      throw new Error("Direct AI provider returned a non-JSON success response.");
    }

    if (!response.ok) {
      throw new Error(describeProviderError(response.status, responseText));
    }

    const message = body.choices?.[0]?.message;
    if (!message) {
      throw new Error("Direct AI provider returned no assistant message.");
    }

    return {
      content: message.content ?? "",
      reasoning: message.reasoning_content ?? undefined,
      toolCalls: (message.tool_calls ?? [])
        .map((call, index) => ({
          id: call.id ?? `tool-${index + 1}`,
          name: call.function?.name ?? "",
          arguments: parseArguments(call.function?.arguments),
        }))
        .filter((call) => call.name.length > 0),
      provider: this.options.providerName ?? "direct-openai-compatible",
      model: body.model ?? model,
    };
  }
}
