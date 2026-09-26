# WORLD Asset Credits / Attribution Registry — 2026-09-26

## Purpose

The WORLD asset license registry is now exposed through the database view:

`public.world_asset_credits_v1`

The view is the runtime/documentation source for generating WORLD asset attribution material without manually copying credit text into application code.

It reads the existing `asset_license_registry` and `asset_registry` records and automatically reflects approved WORLD assets.

## Scope

WORLD scope:

`ASSET_LIBRARY/02_TILES_AND_TERRAIN/%`

Only assets with:

`asset_registry.status = 'approved'`

are included.

The view groups approved WORLD assets by `license_registry_id`, so one attribution block can cover all approved assets that share the same license registry record.

## Exposed fields

- `license_registry_id`
- `source_repository`
- `authors`
- `licenses`
- `source_urls`
- `attribution_required`
- `attribution_text`
- `commercial_use_allowed`
- `modification_allowed`
- `redistribution_allowed`
- `usage_status`
- `asset_count`
- `asset_names`
- `asset_external_keys`
- `credit_block`

## Current WORLD result

The verified WORLD registry currently contains:

- 86 approved WORLD asset records.
- 69 records whose license registry requires attribution.
- 17 records whose license registry marks attribution as not required.

The credit view currently resolves all approved WORLD records into attribution/license groups.

## Credit behavior

For each license registry group, `credit_block` is generated from:

1. the stored `attribution_text`, when present;
2. the recorded license names;
3. the recorded source URLs.

This preserves source-specific wording already stored in the license registry rather than inventing new attribution text.

CC0 entries remain visible in the view even though attribution is not required. This preserves provenance and allows optional courtesy credit without treating it as a legal requirement.

## Important license boundary

This system automates **credit/provenance presentation**. It does not replace the underlying license terms.

In particular:

- CC-BY / CC-BY-SA / OGA-BY records retain their attribution requirements.
- CC-BY-SA records retain their applicable share-alike obligations.
- GPL-bearing records retain their applicable GPL obligations.
- Source-specific attribution files such as `CREDITS-terrain.txt` remain authoritative where the registry explicitly requires them.
- An asset being `approved` in the registry does not override or waive its license terms.

## Security

The view is created with PostgreSQL `security_invoker` so access uses the querying role's permissions and respects underlying row-level security policies.

## No building-system changes

This change is limited to WORLD asset provenance/credits. It does not modify the Building World foundation, terrain resolver, renderer, or map persistence.

## Migration

`supabase/migrations/20260926213000_world_asset_credits_view_v1.sql`
