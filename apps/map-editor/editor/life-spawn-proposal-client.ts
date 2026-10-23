export interface LifeSpawnProposalResult {
  proposalId: string;
  sessionId: string;
  mapId: string;
  worldId: string;
  mapVersion: number;
  status: "pending_approval";
}

/** Persist an authenticated proposal only; approval is a separate explicit action. */
export async function createLifeSpawnProposal(
  accessToken: string,
  input: { mapId: string; life: unknown; x: number; y: number },
  request: typeof fetch = fetch,
): Promise<LifeSpawnProposalResult> {
  if (!accessToken.trim()) throw new Error("Silakan login terlebih dahulu.");
  if (!input.mapId.trim()) throw new Error("ID map otoritatif wajib diisi.");
  if (!Number.isInteger(input.x) || !Number.isInteger(input.y) || input.x < 0 || input.y < 0) throw new Error("Koordinat spawn harus berupa tile integer non-negatif.");
  const response = await request("/api/life-spawn-proposals", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(input),
  });
  const result = await response.json() as Partial<LifeSpawnProposalResult> & { error?: string };
  if (!response.ok || typeof result.proposalId !== "string" || typeof result.sessionId !== "string" || typeof result.mapId !== "string" || typeof result.worldId !== "string" || typeof result.mapVersion !== "number" || result.status !== "pending_approval") {
    throw new Error(result.error ?? "Proposal spawn Life gagal dibuat.");
  }
  return result as LifeSpawnProposalResult;
}

/** Approval is deliberately separate and uses the existing persisted-approval gate. */
export async function approveLifeSpawnProposal(
  accessToken: string,
  proposalId: string,
  request: typeof fetch = fetch,
): Promise<Record<string, unknown>> {
  if (!accessToken.trim()) throw new Error("Silakan login terlebih dahulu.");
  if (!proposalId.trim()) throw new Error("ID proposal wajib diisi.");
  const response = await request("/api/vendrith-ai", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ approve: true, proposalId }),
  });
  const result = await response.json() as Record<string, unknown> & { error?: string };
  if (!response.ok) throw new Error(result.error ?? "Persetujuan proposal gagal.");
  return result;
}


/** Execute a queued intent only after the user has separately approved its proposal. */
export async function executeApprovedLifeSpawnIntent(
  accessToken: string,
  intentId: string,
  request: typeof fetch = fetch,
): Promise<Record<string, unknown>> {
  if (!accessToken.trim()) throw new Error("Silakan login terlebih dahulu.");
  if (!/^[0-9a-fA-F-]{36}$/.test(intentId.trim())) throw new Error("ID runtime intent tidak valid.");
  const response = await request("/api/vendrith-runtime-intents", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ intentId: intentId.trim() }),
  });
  const result = await response.json() as Record<string, unknown> & { error?: string };
  if (!response.ok) throw new Error(result.error ?? "Eksekusi runtime intent gagal.");
  return result;
}
