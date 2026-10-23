\set ON_ERROR_STOP on
BEGIN;
INSERT INTO auth.users(id) VALUES
 ('10000000-0000-4000-8000-000000000001'),
 ('20000000-0000-4000-8000-000000000002')
ON CONFLICT DO NOTHING;
INSERT INTO public.npc_seed_catalog(seed_key, name, metadata, active)
VALUES ('npc-creator-rls-test', 'NPC Creator RLS test', '{}'::jsonb, true)
ON CONFLICT (seed_key) DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
INSERT INTO public.npc_creator_runtime_contract_overrides(seed_key, runtime_contract)
VALUES ('npc-creator-rls-test', '{"version":1,"decisionProfile":{"archetype":"civilian","role":"citizen"},"environmentPolicy":{},"traversalCapabilities":{"canSwim":true,"hasWaterTransport":false}}'::jsonb);
DO $$
BEGIN
  IF (SELECT count(*) FROM public.npc_creator_runtime_contract_overrides WHERE seed_key='npc-creator-rls-test') <> 1 THEN
    RAISE EXCEPTION 'creator must read back their own NPC runtime contract';
  END IF;
END $$;
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true);
DO $$
BEGIN
  IF (SELECT count(*) FROM public.npc_creator_runtime_contract_overrides WHERE seed_key='npc-creator-rls-test') <> 0 THEN
    RAISE EXCEPTION 'another creator must not read the first creator runtime contract';
  END IF;
  UPDATE public.npc_creator_runtime_contract_overrides
     SET runtime_contract='{"version":1}'::jsonb
   WHERE seed_key='npc-creator-rls-test';
  IF FOUND THEN
    RAISE EXCEPTION 'another creator must not update a foreign runtime contract';
  END IF;
  BEGIN
    INSERT INTO public.npc_creator_runtime_contract_overrides(seed_key, created_by, runtime_contract)
    VALUES ('npc-creator-rls-test', '10000000-0000-4000-8000-000000000001', '{"version":1}'::jsonb);
    RAISE EXCEPTION 'a creator must not spoof a different creator owner id';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END $$;
RESET ROLE;
ROLLBACK;
