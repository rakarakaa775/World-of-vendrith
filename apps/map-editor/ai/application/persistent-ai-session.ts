import type { SupabaseClient } from "@supabase/supabase-js";

export const WEB_AI_SESSION_POLICY = {
  maxMessagesPerSession: 100,
  maxStoredMessageLength: 4000,
  maxSessionTitleLength: 120,
} as const;

export type PersistentWebAiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type PersistentWebAiSession = {
  id: string;
  userId: string;
  audience: "web-creator";
  title: string | null;
  status: "active" | "archived";
  contextType: "world" | "region" | "playable" | null;
  contextId: string | null;
  createdAt: string;
  updatedAt: string;
};

type SessionRow = {
  id: string;
  user_id: string;
  audience: "web-creator";
  title: string | null;
  status: "active" | "archived";
  context_type: "world" | "region" | "playable" | null;
  context_id: string | null;
  created_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export class PersistentWebAiSessionStore {
  constructor(private readonly client: SupabaseClient, private readonly userId: string) {}

  async createSession(title?: string, context?: { type: "world" | "region" | "playable"; id: string }): Promise<PersistentWebAiSession> {
    const cleanTitle = title?.trim().slice(0, WEB_AI_SESSION_POLICY.maxSessionTitleLength) || null;
    const { data, error } = await this.client
      .from("vendrith_ai_sessions")
      .insert({ user_id: this.userId, audience: "web-creator", title: cleanTitle, context_type: context?.type ?? null, context_id: context?.id ?? null })
      .select("id,user_id,audience,title,status,context_type,context_id,created_at,updated_at")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to create AI session.");
    return mapSession(data as SessionRow);
  }

  async getSession(sessionId: string): Promise<PersistentWebAiSession | null> {
    const { data, error } = await this.client
      .from("vendrith_ai_sessions")
      .select("id,user_id,audience,title,status,created_at,updated_at")
      .eq("id", sessionId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapSession(data as SessionRow) : null;
  }

  async loadHistory(sessionId: string): Promise<PersistentWebAiMessage[]> {
    const { data, error } = await this.client
      .from("vendrith_ai_messages")
      .select("id,role,content,created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .limit(WEB_AI_SESSION_POLICY.maxMessagesPerSession);
    if (error) throw new Error(error.message);
    return ((data ?? []) as MessageRow[]).map(mapMessage);
  }

  async appendMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string,
  ): Promise<PersistentWebAiMessage> {
    const cleanContent = content.trim().slice(0, WEB_AI_SESSION_POLICY.maxStoredMessageLength);
    if (!cleanContent) throw new Error("AI session message cannot be empty.");
    const { data, error } = await this.client
      .from("vendrith_ai_messages")
      .insert({ session_id: sessionId, user_id: this.userId, role, content: cleanContent })
      .select("id,role,content,created_at")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to persist AI session message.");

    const { error: touchError } = await this.client
      .from("vendrith_ai_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", sessionId);
    if (touchError) throw new Error(touchError.message);

    return mapMessage(data as MessageRow);
  }
}

function mapSession(row: SessionRow): PersistentWebAiSession {
  return {
    id: row.id,
    userId: row.user_id,
    audience: row.audience,
    title: row.title,
    status: row.status,
    contextType: row.context_type,
    contextId: row.context_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMessage(row: MessageRow): PersistentWebAiMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  };
}
