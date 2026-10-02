import { describe, expect, it, vi } from "vitest";
import { createSupabaseAssetRegistryAdapter } from "./asset-registry";

describe("Supabase asset registry adapter", () => {
  it("queries the canonical asset inventory view and maps license evidence", async () => {
    const limit = vi.fn(async () => ({ data: [{ id: "asset-1", external_key: "lpc-terrain-water", name: "Water", category: "terrain", role: "water", asset_path: "assets/world/water.png", source_name: "LPC Terrains", licenses: ["CC-BY-SA 3.0"], attribution_required: true, attribution_text: "Credit authors", license_verification_status: "verified", license_usage_status: "allowed" }], error: null }));
    const or = vi.fn(() => ({ limit }));
    const select = vi.fn(() => ({ or, limit }));
    const from = vi.fn(() => ({ select }));
    const client = { from } as never;
    const adapter = createSupabaseAssetRegistryAdapter(client);
    const evidence = await adapter.search("water");
    expect(from).toHaveBeenCalledWith("asset_library_inventory_v1");
    expect(or).toHaveBeenCalled();
    expect(limit).toHaveBeenCalledWith(8);
    expect(evidence[0].source).toContain("lpc-terrain-water");
    expect(evidence[0].fact).toContain("verified");
    expect(evidence[0].fact).toContain("allowed");
  });
  it("caps configured result limits", async () => {
    const limit = vi.fn(async () => ({ data: [], error: null }));
    const select = vi.fn(() => ({ limit }));
    const from = vi.fn(() => ({ select }));
    const client = { from } as never;
    const adapter = createSupabaseAssetRegistryAdapter(client, { limit: 999 });
    await adapter.search("");
    expect(limit).toHaveBeenCalledWith(50);
  });
});
