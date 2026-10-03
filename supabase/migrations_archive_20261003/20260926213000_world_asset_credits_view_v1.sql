create or replace view public.world_asset_credits_v1
with (security_invoker = on)
as
select
  lr.id as license_registry_id,
  lr.source_repository,
  lr.authors,
  lr.licenses,
  lr.source_urls,
  lr.attribution_required,
  lr.attribution_text,
  lr.commercial_use_allowed,
  lr.modification_allowed,
  lr.redistribution_allowed,
  lr.usage_status,
  count(ar.id)::integer as asset_count,
  array_agg(ar.name order by ar.name) as asset_names,
  array_agg(ar.external_key order by ar.external_key) as asset_external_keys,
  concat_ws(
    E'\n',
    nullif(btrim(lr.attribution_text), ''),
    case
      when cardinality(lr.licenses) > 0
      then 'License: ' || array_to_string(lr.licenses, ' / ')
      else null
    end,
    case
      when cardinality(lr.source_urls) > 0
      then 'Source: ' || array_to_string(lr.source_urls, ', ')
      else null
    end
  ) as credit_block
from public.asset_license_registry lr
join public.asset_registry ar
  on ar.license_registry_id = lr.id
where ar.asset_path like 'ASSET_LIBRARY/02_TILES_AND_TERRAIN/%'
  and ar.status = 'approved'
group by
  lr.id,
  lr.source_repository,
  lr.authors,
  lr.licenses,
  lr.source_urls,
  lr.attribution_required,
  lr.attribution_text,
  lr.commercial_use_allowed,
  lr.modification_allowed,
  lr.redistribution_allowed,
  lr.usage_status;

grant select on public.world_asset_credits_v1 to anon, authenticated;
