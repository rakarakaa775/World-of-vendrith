# Vandrith Database — Table Specification v0.1 COMPLETE

**Status:** `COMPLETE WORKING SPECIFICATION — READY FOR SQL REVIEW`
**Target:** Supabase / PostgreSQL
**Scope:** v0.1 beginner-village simulator, Crescent Moon Village, 50–100 starting Lives, one in-world year.

## Lock Rule
This document extends the already completed geographic specification. It does NOT redesign the Foundation/Schema/ERD. It converts the canonical core table inventory into an implementation-ready contract. SQL remains unapplied.

## Conventions
- UUID primary IDs.
- `timestamptz` for simulation timestamps unless a table explicitly stores a tick/count.
- enum-like state uses `text` + CHECK.
- `created_at`/`updated_at` are database audit timestamps.
- Simulation progression is owned by Time Engine.
- Historical records are append-only where stated.
- Many-to-many and time-bounded relationships use explicit tables.
- Domain engines do not directly mutate unrelated authoritative tables.

## 06. buildings

**Owner:** Settlement

**Columns:** `id uuid PK; settlement_id uuid FK→settlements.id NOT NULL; building_type text NOT NULL; name text NOT NULL; condition text NOT NULL DEFAULT 'good'; owner_id uuid NULL; status text NOT NULL DEFAULT 'active'; created_at timestamptz; updated_at timestamptz`

**Rules:** Indexes: settlement_id, owner_id, status. FK settlement RESTRICT while dependent history/services exist. Building type is catalog-driven. Homes and public buildings are supported.

## 07. services

**Owner:** Settlement

**Columns:** `id uuid PK; building_id uuid FK→buildings.id NOT NULL; service_type text NOT NULL; active boolean NOT NULL DEFAULT true; name text NULL; created_at timestamptz; updated_at timestamptz`

**Rules:** Index building_id, service_type, active. A service is attached to a building; service availability must not become a duplicate building state.

## 08. resources

**Owner:** Settlement/World

**Columns:** `id uuid PK; settlement_id uuid FK→settlements.id NOT NULL; resource_type text NOT NULL; quantity numeric NOT NULL DEFAULT 0; state text NULL; regeneration_rate numeric NULL; status text NOT NULL DEFAULT 'active'; updated_at timestamptz; created_at timestamptz`

**Rules:** Indexes settlement_id, resource_type, status. quantity >= 0. Supports local resources and the planned small variable mine. Resource extraction/regen rules belong to the owning engine, not the row schema.

## 09. settlement_history

**Owner:** History

**Columns:** `id uuid PK; settlement_id uuid FK→settlements.id NOT NULL; event_id uuid FK→history_events.id NOT NULL; created_at timestamptz`

**Rules:** UNIQUE(settlement_id,event_id). Link table only; does not duplicate event facts.

## 10. households

**Owner:** Social/Life

**Columns:** `id uuid PK; settlement_id uuid FK→settlements.id NULL; residence_location_id uuid FK→locations.id NULL; household_type text NOT NULL; status text NOT NULL DEFAULT 'active'; created_at timestamptz; updated_at timestamptz`

**Rules:** Indexes settlement_id, residence_location_id, status. Household is a living unit, not a family identity.

## 11. family_groups

**Owner:** Social

**Columns:** `id uuid PK; name text NULL; family_type text NULL; status text NOT NULL DEFAULT 'active'; created_at timestamptz; updated_at timestamptz`

**Rules:** Long-term kinship identity. Do not encode mother/father/spouse as fixed columns.

## 12. family_memberships

**Owner:** Social

**Columns:** `id uuid PK; life_id uuid FK→lives.id NOT NULL; family_id uuid FK→family_groups.id NOT NULL; relation_type text NOT NULL; start_time timestamptz NULL; end_time timestamptz NULL; status text NOT NULL DEFAULT 'active'`

**Rules:** Indexes life_id, family_id, status. Time-bounded membership.

## 13. relationships

**Owner:** Social

**Columns:** `id uuid PK; life_a uuid FK→lives.id NOT NULL; life_b uuid FK→lives.id NOT NULL; relationship_type text NOT NULL; strength numeric NOT NULL DEFAULT 0; status text NOT NULL DEFAULT 'active'; start_time timestamptz NULL; end_time timestamptz NULL`

**Rules:** Indexes life_a, life_b, relationship_type, status. CHECK life_a <> life_b. Supports friendship, rivalry, adoption, mentorship, partnership, kinship and future relations.

## 14. communities

**Owner:** Social

**Columns:** `id uuid PK; settlement_id uuid FK→settlements.id NULL; name text NOT NULL; community_type text NOT NULL; status text NOT NULL DEFAULT 'active'; created_at timestamptz; updated_at timestamptz`

**Rules:** Indexes settlement_id, status.

## 15. community_memberships

**Owner:** Social

**Columns:** `id uuid PK; life_id uuid FK→lives.id NOT NULL; community_id uuid FK→communities.id NOT NULL; role text NULL; start_time timestamptz NULL; end_time timestamptz NULL; status text NOT NULL DEFAULT 'active'`

**Rules:** Indexes life_id, community_id, status.

## 16. lives

**Owner:** Life

**Columns:** `id uuid PK; name text NOT NULL; sex text NULL; birth_date timestamptz NULL; death_date timestamptz NULL; status text NOT NULL DEFAULT 'alive'; location_id uuid FK→locations.id NULL; household_id uuid FK→households.id NULL; fate_grade text NULL; created_at timestamptz; updated_at timestamptz`

**Rules:** Indexes location_id, household_id, status. death_date required when status=dead. Fate is potential, not guaranteed destiny.

## 17. life_attributes

**Owner:** Life

**Columns:** `life_id uuid FK→lives.id NOT NULL; attribute_type text NOT NULL; value numeric NOT NULL; source text NULL; created_at timestamptz; updated_at timestamptz; PK(life_id,attribute_type)`

**Rules:** Extensible stats; no duplicated authoritative state.

## 18. life_needs

**Owner:** Life

**Columns:** `life_id uuid FK→lives.id NOT NULL; need_type text NOT NULL; current_value numeric NOT NULL; target_value numeric NOT NULL; updated_at timestamptz; PK(life_id,need_type)`

**Rules:** Supports food, rest, social and future needs. Values constrained to domain range by engine policy.

## 19. life_skills

**Owner:** Life

**Columns:** `life_id uuid FK→lives.id NOT NULL; skill_id uuid NULL; skill_type text NOT NULL; level numeric NOT NULL DEFAULT 0; experience numeric NOT NULL DEFAULT 0; PK(life_id,skill_type)`

**Rules:** Skill progression hook. Detailed Skill catalog can later replace/augment skill_type without changing Life identity.

## 20. birth_records

**Owner:** Life/History

**Columns:** `id uuid PK; life_id uuid FK→lives.id NOT NULL; parent_a_id uuid FK→lives.id NULL; parent_b_id uuid FK→lives.id NULL; birth_location_id uuid FK→locations.id NULL; birth_time timestamptz NOT NULL; created_at timestamptz`

**Rules:** Historical birth record. Parents are nullable and historical; no fixed parent columns on lives.

## 21. death_records

**Owner:** Life/History

**Columns:** `id uuid PK; life_id uuid FK→lives.id NOT NULL; death_time timestamptz NOT NULL; cause text NOT NULL; location_id uuid FK→locations.id NULL; created_at timestamptz`

**Rules:** Historical death record. One authoritative death record per Life.

## 22. organizations

**Owner:** Organization

**Columns:** `id uuid PK; name text NOT NULL; organization_type text NOT NULL; settlement_id uuid FK→settlements.id NULL; description text NULL; status text NOT NULL DEFAULT 'active'; created_at timestamptz; updated_at timestamptz`

**Rules:** Guilds, churches, businesses, institutions and factions. Political status is not implied.

## 23. organization_memberships

**Owner:** Organization

**Columns:** `id uuid PK; life_id uuid FK→lives.id NOT NULL; organization_id uuid FK→organizations.id NOT NULL; role_id uuid NULL; start_time timestamptz NULL; end_time timestamptz NULL; status text NOT NULL DEFAULT 'active'`

**Rules:** Indexes life_id, organization_id, status.

## 24. roles

**Owner:** Organization/System

**Columns:** `id uuid PK; name text NOT NULL UNIQUE; description text NULL; role_type text NULL; created_at timestamptz; updated_at timestamptz`

**Rules:** Role definition. Do not confuse with Foundation authorization roles if both domains are retained; domain namespace must be explicit during SQL reconciliation.

## 25. occupations

**Owner:** Organization

**Columns:** `id uuid PK; name text NOT NULL UNIQUE; description text NULL; occupation_type text NULL; created_at timestamptz; updated_at timestamptz`

**Rules:** Occupation catalog.

## 26. employment

**Owner:** Organization

**Columns:** `id uuid PK; life_id uuid FK→lives.id NOT NULL; organization_id uuid FK→organizations.id NULL; occupation_id uuid FK→occupations.id NOT NULL; start_time timestamptz NOT NULL; end_time timestamptz NULL; status text NOT NULL DEFAULT 'active'`

**Rules:** Indexes life_id, organization_id, occupation_id, status. Employment is time-bounded.

## 27. simulation_clock

**Owner:** Time

**Columns:** `id uuid PK; world_id uuid FK→worlds.id NOT NULL UNIQUE; current_tick bigint NOT NULL DEFAULT 0; current_date timestamptz NOT NULL; speed numeric NOT NULL DEFAULT 1; paused boolean NOT NULL DEFAULT false; updated_at timestamptz`

**Rules:** Time Engine authority. No other engine owns progression.

## 28. calendar_definitions

**Owner:** Time

**Columns:** `id uuid PK; world_id uuid FK→worlds.id NOT NULL; name text NOT NULL; rules jsonb NOT NULL; active boolean NOT NULL DEFAULT true; created_at timestamptz; updated_at timestamptz`

**Rules:** Calendar configuration; one active calendar per world enforced at application/domain level unless a future SQL exclusion policy is approved.

## 29. time_events

**Owner:** Time

**Columns:** `id uuid PK; world_id uuid FK→worlds.id NOT NULL; event_type text NOT NULL; scheduled_time timestamptz NOT NULL; status text NOT NULL DEFAULT 'scheduled'; payload jsonb NULL; created_at timestamptz; updated_at timestamptz`

**Rules:** Indexes world_id, scheduled_time, status.

## 30. day_records

**Owner:** Time

**Columns:** `id uuid PK; world_id uuid FK→worlds.id NOT NULL; simulation_date timestamptz NOT NULL; summary jsonb NULL; created_at timestamptz`

**Rules:** Optional daily aggregate. Not authoritative for tick progression.

## 31. life_energy

**Owner:** Energy

**Columns:** `life_id uuid PK/FK→lives.id; current_energy numeric NOT NULL; max_energy numeric NOT NULL; fatigue numeric NOT NULL DEFAULT 0; state text NOT NULL DEFAULT 'normal'; updated_at timestamptz`

**Rules:** Energy Engine authority for current energy state.

## 32. energy_history

**Owner:** Energy/History

**Columns:** `id uuid PK; life_id uuid FK→lives.id NOT NULL; timestamp timestamptz NOT NULL; old_state text NULL; new_state text NOT NULL; cause text NULL; created_at timestamptz`

**Rules:** Append-only state transition history.

## 33. activity_definitions

**Owner:** Activity

**Columns:** `id uuid PK; name text NOT NULL UNIQUE; activity_type text NOT NULL; default_duration numeric NULL; energy_cost numeric NULL; metadata jsonb NULL; status text NOT NULL DEFAULT 'active'; created_at timestamptz; updated_at timestamptz`

**Rules:** Catalog for work, sleep, eat, travel, socialize, study, trade, etc.

## 34. activities

**Owner:** Activity

**Columns:** `id uuid PK; actor_life_id uuid FK→lives.id NOT NULL; activity_definition_id uuid FK→activity_definitions.id NOT NULL; location_id uuid FK→locations.id NULL; start_time timestamptz NOT NULL; end_time timestamptz NULL; state text NOT NULL DEFAULT 'scheduled'; metadata jsonb NULL; created_at timestamptz; updated_at timestamptz`

**Rules:** Activity Engine owns execution. Index actor_life_id, state, start_time.

## 35. schedules

**Owner:** Activity

**Columns:** `id uuid PK; life_id uuid FK→lives.id NOT NULL; name text NOT NULL; status text NOT NULL DEFAULT 'active'; priority integer NOT NULL DEFAULT 0; created_at timestamptz; updated_at timestamptz`

**Rules:** Recurring schedule definition.

## 36. schedule_entries

**Owner:** Activity

**Columns:** `id uuid PK; schedule_id uuid FK→schedules.id NOT NULL; activity_definition_id uuid FK→activity_definitions.id NOT NULL; start_minute integer NOT NULL; end_minute integer NOT NULL; priority integer NOT NULL DEFAULT 0`

**Rules:** CHECK start_minute < end_minute; indexes schedule_id and time window.

## 37. travel_records

**Owner:** Activity/World

**Columns:** `id uuid PK; actor_life_id uuid FK→lives.id NOT NULL; origin_location_id uuid FK→locations.id NOT NULL; destination_location_id uuid FK→locations.id NOT NULL; departure_time timestamptz NOT NULL; arrival_time timestamptz NULL; state text NOT NULL DEFAULT 'planned'`

**Rules:** CHECK origin <> destination. Events travel:started and travel:arrived are emitted by Activity/World contracts.

## 38. activity_interruptions

**Owner:** Activity

**Columns:** `id uuid PK; activity_id uuid FK→activities.id NOT NULL; cause text NOT NULL; interrupted_at timestamptz NOT NULL; resolved_at timestamptz NULL; resolution text NULL; status text NOT NULL DEFAULT 'active'`

**Rules:** Append transition record; activity execution owns resolution.

## 39. items

**Owner:** Inventory

**Columns:** `id uuid PK; name text NOT NULL UNIQUE; item_type text NOT NULL; stackable boolean NOT NULL DEFAULT true; metadata jsonb NULL; status text NOT NULL DEFAULT 'active'; created_at timestamptz; updated_at timestamptz`

**Rules:** Inventory schema hook; full Inventory Engine later.

## 40. item_instances

**Owner:** Inventory

**Columns:** `id uuid PK; item_id uuid FK→items.id NOT NULL; quantity numeric NOT NULL DEFAULT 1; condition numeric NULL; metadata jsonb NULL; created_at timestamptz; updated_at timestamptz`

**Rules:** Individual/stacked item state.

## 41. containers

**Owner:** Inventory

**Columns:** `id uuid PK; owner_type text NOT NULL; owner_id uuid NOT NULL; container_type text NOT NULL; capacity numeric NULL; status text NOT NULL DEFAULT 'active'; created_at timestamptz; updated_at timestamptz`

**Rules:** Owner/container abstraction. Polymorphic owner must be constrained at service/domain boundary.

## 42. inventory_entries

**Owner:** Inventory

**Columns:** `id uuid PK; container_id uuid FK→containers.id NOT NULL; item_id uuid FK→items.id NOT NULL; item_instance_id uuid FK→item_instances.id NULL; quantity numeric NOT NULL DEFAULT 0; updated_at timestamptz`

**Rules:** Basic inventory hook; uniqueness and stacking rules belong to Inventory Engine.

## 43. history_events

**Owner:** History

**Columns:** `id uuid PK; event_type text NOT NULL; scope_type text NOT NULL; scope_id uuid NOT NULL; timestamp timestamptz NOT NULL; summary text NULL; metadata jsonb NULL; created_at timestamptz`

**Rules:** Generic cause→process→consequence event model. Not every tick becomes world history.

## 44. history_causes

**Owner:** History

**Columns:** `id uuid PK; event_id uuid FK→history_events.id NOT NULL; cause_type text NOT NULL; cause_reference text NULL; metadata jsonb NULL`

**Rules:** Append-only.

## 45. history_consequences

**Owner:** History

**Columns:** `id uuid PK; event_id uuid FK→history_events.id NOT NULL; consequence_type text NOT NULL; consequence_reference text NULL; metadata jsonb NULL`

**Rules:** Append-only.

## 46. history_participants

**Owner:** History

**Columns:** `id uuid PK; event_id uuid FK→history_events.id NOT NULL; entity_type text NOT NULL; entity_id uuid NOT NULL; role text NULL`

**Rules:** Explicit event participation.

## 47. history_locations

**Owner:** History

**Columns:** `id uuid PK; event_id uuid FK→history_events.id NOT NULL; location_id uuid FK→locations.id NOT NULL`

**Rules:** Event-location link.

## 48. legacies

**Owner:** Legacy

**Columns:** `id uuid PK; identity text NOT NULL; origin text NULL; creator_entity_type text NULL; creator_entity_id uuid NULL; purpose text NULL; creation_time timestamptz NULL; current_status text NOT NULL DEFAULT 'active'; created_at timestamptz; updated_at timestamptz`

**Rules:** Basic Legacy hook. Version history is authoritative.

## 49. legacy_versions

**Owner:** Legacy

**Columns:** `id uuid PK; legacy_id uuid FK→legacies.id NOT NULL; version_number integer NOT NULL; state jsonb NOT NULL; created_at timestamptz NOT NULL; reason text NULL; UNIQUE(legacy_id,version_number)`

**Rules:** Append-only versions.

## 50. legacy_modifications

**Owner:** Legacy

**Columns:** `id uuid PK; legacy_id uuid FK→legacies.id NOT NULL; old_version integer NOT NULL; new_version integer NOT NULL; modifier_entity_type text NULL; modifier_entity_id uuid NULL; reason text NULL; history_event_id uuid FK→history_events.id NULL; created_at timestamptz NOT NULL`

**Rules:** Append-only modification trail.

## 51. legacy_links

**Owner:** Legacy

**Columns:** `id uuid PK; legacy_id uuid FK→legacies.id NOT NULL; entity_type text NOT NULL; entity_id uuid NOT NULL; relationship_type text NULL; created_at timestamptz NOT NULL`

**Rules:** Links Legacy to Life/Organization/Civilization/Settlement/Polity without forcing future domains into v0.1.

## 52. civilizations

**Owner:** Civilization Hook

**Columns:** `id uuid PK; name text NOT NULL; description text NULL; status text NOT NULL DEFAULT 'active'; metadata jsonb NULL; created_at timestamptz; updated_at timestamptz`

**Rules:** Schema-ready hook; not fully activated in beginner village.

## 53. cultures

**Owner:** Civilization Hook

**Columns:** `id uuid PK; name text NOT NULL; description text NULL; metadata jsonb NULL; status text NOT NULL DEFAULT 'active'; created_at timestamptz; updated_at timestamptz`

**Rules:** Schema-ready.

## 54. languages

**Owner:** Civilization Hook

**Columns:** `id uuid PK; name text NOT NULL; description text NULL; status text NOT NULL DEFAULT 'active'; created_at timestamptz; updated_at timestamptz`

**Rules:** Schema-ready.

## 55. religions

**Owner:** Civilization Hook

**Columns:** `id uuid PK; name text NOT NULL; description text NULL; status text NOT NULL DEFAULT 'active'; created_at timestamptz; updated_at timestamptz`

**Rules:** Schema-ready.

## 56. civilization_influences

**Owner:** Civilization Hook

**Columns:** `id uuid PK; civilization_id uuid FK→civilizations.id NOT NULL; target_type text NOT NULL; target_id uuid NOT NULL; strength numeric NOT NULL DEFAULT 0; start_time timestamptz NULL; end_time timestamptz NULL`

**Rules:** Polymorphic target kept as a hook; full Civilization implementation is later.

## 57. polities

**Owner:** Polity Hook

**Columns:** `id uuid PK; name text NOT NULL; polity_type text NOT NULL; status text NOT NULL DEFAULT 'active'; description text NULL; created_at timestamptz; updated_at timestamptz`

**Rules:** Political entity. Must remain separate from Settlement and Civilization.

## 58. polity_memberships

**Owner:** Polity Hook

**Columns:** `id uuid PK; polity_id uuid FK→polities.id NOT NULL; entity_type text NOT NULL; entity_id uuid NOT NULL; role text NULL; start_time timestamptz NULL; end_time timestamptz NULL; status text NOT NULL DEFAULT 'active'`

**Rules:** Relationship hook for Lives/Organizations/Civilizations/Polities.

## Implementation Order

1. Foundation/Auth tables already locked separately.
2. worlds → continents → regions → locations → settlements
3. buildings → services → resources → settlement_history
4. households → family_groups → lives → family_memberships → relationships → communities → community_memberships
5. organizations → roles → occupations → organization_memberships → employment
6. simulation_clock → calendar_definitions → time_events → day_records
7. life_energy → energy_history
8. activity_definitions → activities → schedules → schedule_entries → travel_records → activity_interruptions
9. items → item_instances → containers → inventory_entries
10. history_events → history_causes → history_consequences → history_participants → history_locations
11. legacies → legacy_versions → legacy_modifications → legacy_links
12. civilization/polity hooks last.

## Critical Naming Decision
`roles` in the Organization domain must not be silently merged with Foundation authorization roles. If both are implemented in one PostgreSQL schema, use an explicit namespace/table distinction before SQL generation.

## Critical Security/Ownership Decision
No credential/password/access-token/session-token storage is introduced by these simulation tables. Authentication credentials remain under Supabase Auth.

## Resource / Mine
`resources` is the authoritative local resource hook. A small variable mine is represented as a resource/location/building configuration, not as a new special-purpose Foundation table unless a later mining-system requirement proves one necessary.

## Review Gate
This document completes the table inventory/specification layer for the v0.1 simulation scope. SQL should be generated only after a final schema collision check against the existing Foundation authorization tables and engine-owned tables.
