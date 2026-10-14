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
  error?: { message?: string };
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

/**
 * Direct OpenAI-compatible model provider.
 *
 * This bypasses Vercel AI Gateway and talks directly to the configured
 * provider endpoint. The adapter remains replaceable through ModelProviderPort.
 */

const TRANSIENT_HTTP_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES_PER_MODEL = 2;
const RETRY_DELAYS_MS = [500, 1200];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveFallbackModels(primaryModel: string, isGemini: boolean): string[] {
  if (!isGemini) return [];
  const configured = (process.env.VENDRITH_AI_FALLBACK_MODELS ?? "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);
  const defaults = configured.length > 0
    ? configured
    : ["gemini-3.8-flash", "gemini-3.5-flash-lite"];
  return [...new Set(defaults)].filter((model) => model !== primaryModel);
}

function errorMessage(body: OpenAiCompatibleResponse, status: number): string {
  return body.error?.message ?? "Direct AI provider request failed (" + status + ")";
}

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


    const models = [model, ...resolveFallbackModels(model, isGemini)];
    const failures: string[] = [];

    for (const candidateModel of models) {
      for (let attempt = 0; attempt <= MAX_RETRIES_PER_MODEL; attempt += 1) {
        let response: Response;
        try {
          response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
            method: "POST",
            headers: {
              Authorization: "Bearer " + apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: candidateModel,
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
        } catch (error) {
          const message = error instanceof Error ? error.message : "Network request failed";
          failures.push(candidateModel + ": " + message);
          if (attempt < MAX_RETRIES_PER_MODEL) {
            await wait(RETRY_DELAYS_MS[attempt] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1]);
            continue;
          }
          break;
        }

        let body: OpenAiCompatibleResponse;
        try {
          body = (await response.json()) as OpenAiCompatibleResponse;
        } catch {
          body = {};
        }

        if (!response.ok) {
          const message = errorMessage(body, response.status);
          failures.push(candidateModel + " (HTTP " + response.status + "): " + message);
          if (TRANSIENT_HTTP_STATUSES.has(response.status) && attempt < MAX_RETRIES_PER_MODEL) {
            await wait(RETRY_DELAYS_MS[attempt] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1]);
            continue;
          }
          // Do not retry non-transient provider errors; try another model only for transient failures.
          if (TRANSIENT_HTTP_STATUSES.has(response.status)) break;
          throw new Error(message);
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
              id: call.id ?? "tool-" + (index + 1),
              name: call.function?.name ?? "",
              arguments: parseArguments(call.function?.arguments),
            }))
            .filter((call) => call.name.length > 0),
          provider: this.options.providerName ?? "direct-openai-compatible",
          model: body.model ?? candidateModel,
        };
      }
    }

    throw new Error(
      "Direct AI provider exhausted retries/fallback models. " +
      failures.slice(-6).join(" | "),
    );
  }
}
