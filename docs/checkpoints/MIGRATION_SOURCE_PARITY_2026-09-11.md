# Migration Source Parity — 2026-09-11

## Scope

Reconciliation of the live Supabase migration ledger for project `ojtmfokjcirvjvhnbnos` against the source-controlled `supabase/migrations/` directory in `rakarakaa775/World-of-vendrith`.

## Verified state

- Live Supabase contains a substantially larger migration history than the repository's currently captured migration directory.
- The repository `supabase/migrations/` directory currently exposes only the captured `20260908_inventory_mutation_gateways.sql` migration through the GitHub contents API.
- The live migration ledger includes the environment/time sequence beginning at `20260909145552 weather_resolution_v1_0` and continuing through the environment runtime contract migrations on 2026-09-10, plus the two time-engine season mapping bridge migrations created during this audit.
- Exact SQL bodies for the live-only migrations were not recovered from the GitHub repository.
- The project checkpoint explicitly states: do not fabricate missing migration SQL from migration names.

## Environment/time migration family observed in live Supabase

- `20260909145552 weather_resolution_v1_0`
- `20260909145609 weather_resolution_v1_1_deterministic_order`
- `20260909151454 region_climate_weather_modifiers_v1_fix`
- `20260909151739 weather_resolution_pipeline_v1_fix`
- `20260909152219 weather_environment_effects_v1`
- `20260909152326 seasonal_environment_effects_v1`
- `20260909152717 seasonal_variant_resolver_v1`
- `20260909152948 terrain_seasonal_resolver_v1`
- `20260909153252 terrain_seasonal_bindings_v1`
- `20260909153611 map_environment_snapshot_v1_fix`
- `20260909153732 world_environment_state_v1`
- `20260909154148 world_environment_clock_v1`
- `20260909155809 season_cycle_config_v1`
- `20260909160004 weather_transition_policy_v1`
- `20260909160332 environment_tick_v1`
- `20260909160721 weather_transition_executor_v1`
- `20260909161129 weighted_weather_resolver_v1`
- `20260909161431 weather_transition_context_v1`
- `20260909161742 weather_transition_runtime_v2`
- `20260909161925 environment_runtime_initialization_v1`
- `20260910093926 add_environment_configuration_contract_validator_v1`
- `20260910094214 harden_environment_configuration_contract_v1`
- `20260910094337 add_environment_design_canon_audit_v1`
- `20260910094505 refine_environment_design_canon_registry_v1`
- `20260910095614 add_authoritative_season_resolver_v1`
- `20260910095712 integrate_authoritative_season_environment_bridge_v1`
- `20260910095738 fix_authoritative_season_bridge_contract_v1`
- `20260910095752 fix_environment_readiness_gate_v3_contract_v1`
- `20260910095957 add_calendar_season_mapping_contract_v1`
- `20260910100114 harden_calendar_season_mapping_contract_v2`
- `20260910100317 add_time_calendar_season_mapping_contract_registry_v1`
- `20260910100419 harden_time_calendar_season_mapping_contract_v1`
- `20260910103952 harden_calendar_season_mapping_validator_contract_v1`
- `20260910111251 harden_environment_simulation_rls_v1`
- `20260910111941 lock_environment_mutation_routines_to_engine_roles_v1`
- `20260910112009 close_public_environment_mutation_routines_v1`
- `20260910112153 lock_legacy_environment_mutation_routines_v1`
- `20260910113429 harden_environment_search_paths_v1`
- `20260910113530 harden_remaining_environment_search_paths_v1`
- `20260910114107 harden_time_environment_asset_search_paths_v1`
- `20260910114432 harden_seasonal_asset_variant_license_verification_v1`
- `20260910174620 lock_down_environment_runtime_tables`
- `20260910175136 add_environment_runtime_read_contract_v1`
- `20260910175151 grant_environment_runtime_server_read_v1`
- `20260910175212 restrict_environment_runtime_view_privileges_v2`
- `20260910175231 lock_environment_runtime_view_default_privileges_v1`
- `20260910175243 fix_environment_runtime_view_join_contract_v1`
- `20260910175253 fix_environment_runtime_season_key_join_v1`
- `20260910175310 environment_runtime_contract_ready_v1`
- `20260910175333 revoke_environment_runtime_base_table_server_default_access_v1`
- `20260910175359 environment_runtime_view_security_v1`
- `20260910175412 remove_overbroad_default_privilege_change_v1`
- `20260910175421 finalize_environment_runtime_view_access_v1`
- `20260910175446 environment_runtime_view_index_contract_v1`
- `20260910175511 environment_runtime_contract_comment_v2`
- `20260910191233 add_time_engine_season_mapping_bridge_v1`
- `20260910191254 fix_time_engine_season_mapping_bridge_v1_active_column`

## Historical source evidence

The uploaded Vandrith project checkpoint contains the full `Time_Engine_Blueprint_v1.0.md`. It specifies that season is calculated from calendar month plus configuration-defined `seasonMapping`, with an example/default of three months per season starting with Spring in month 1. It does not establish a mandatory production `duration_days` value for `season_cycle_rules`, nor does it define the later weather-transition policy table introduced in the live runtime.

## Guardrail

No attempt is made here to reconstruct or fabricate missing migration SQL. Runtime state remains authoritative in Supabase; repository source remains authoritative only for source-controlled content.

## Next action

Recover exact SQL bodies from an authoritative source or export, then add them to `supabase/migrations/` in chronological order and verify parity. Until exact bodies are recovered, do not rewrite live migrations or infer SQL from migration names.
