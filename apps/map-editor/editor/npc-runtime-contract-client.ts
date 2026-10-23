export interface PersistNpcRuntimeContractResult {
  saved: true;
  seedKey: string;
  updatedAt: string;
}

/** Authenticated client boundary for an explicit, user-triggered NPC contract save. */
export async function persistNpcRuntimeContract(
  accessToken: string,
  seedKey: string,
  runtimeContract: unknown,
  request: typeof fetch = fetch,
): Promise<PersistNpcRuntimeContractResult> {
  const token = accessToken.trim();
  const key = seedKey.trim();
  if (!token) throw new Error("Silakan login terlebih dahulu.");
  if (!key) throw new Error("Seed key NPC wajib diisi.");
  if (typeof runtimeContract !== "object" || runtimeContract === null || Array.isArray(runtimeContract)) {
    throw new Error("Runtime contract harus berupa objek JSON.");
  }

  const response = await request("/api/npc-runtime-contract", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ seedKey: key, runtimeContract }),
  });
  const result = await response.json() as { saved?: boolean; seedKey?: string; updatedAt?: string; error?: string };
  if (!response.ok || result.saved !== true || typeof result.seedKey !== "string" || typeof result.updatedAt !== "string") {
    throw new Error(result.error ?? "Kontrak NPC gagal disimpan.");
  }
  return { saved: true, seedKey: result.seedKey, updatedAt: result.updatedAt };
}
