import type { AiMode } from "../domain/types";

export type ModelRole = "system" | "user" | "assistant" | "tool";

export interface ModelMessage {
  role: ModelRole;
  content: string;
  toolCallId?: string;
  toolCalls?: ModelToolCall[];
}

export interface ModelToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ModelToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ModelRequest {
  messages: ModelMessage[];
  tools?: ModelToolDefinition[];
  mode?: AiMode;
  openThinking?: boolean;
}

export interface ModelResponse {
  content: string;
  toolCalls: ModelToolCall[];
  reasoning?: string;
  provider: string;
  model?: string;
}

export interface ModelProviderPort {
  generate(request: ModelRequest): Promise<ModelResponse>;
}
