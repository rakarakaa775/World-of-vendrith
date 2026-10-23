-- Authenticated, per-user NPC Creator contract persistence.
-- Deliberately separate from the shared npc_seed_catalog so users cannot mutate
-- globally shared seed rows or overwrite another creator's NPC runtime policy.
CREATE TABLE IF NOT EXISTS public.npc_creator_runtime_contract_overrides (
  seed_key text NOT NULL REFERENCES public.npc_seed_catalog(seed_key) ON DELETE CASCADE,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  runtime_contract jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT npc_creator_runtime_contract_overrides_pkey PRIMARY KEY (seed_key, created_by),
  CONSTRAINT npc_creator_runtime_contract_overrides_contract_object CHECK (jsonb_typeof(runtime_contract) = 'object')
);

ALTER TABLE public.npc_creator_runtime_contract_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.npc_creator_runtime_contract_overrides FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS npc_creator_runtime_contract_overrides_select_own ON public.npc_creator_runtime_contract_overrides;
CREATE POLICY npc_creator_runtime_contract_overrides_select_own
  ON public.npc_creator_runtime_contract_overrides FOR SELECT TO authenticated
  USING (created_by = (SELECT auth.uid()));
DROP POLICY IF EXISTS npc_creator_runtime_contract_overrides_insert_own ON public.npc_creator_runtime_contract_overrides;
CREATE POLICY npc_creator_runtime_contract_overrides_insert_own
  ON public.npc_creator_runtime_contract_overrides FOR INSERT TO authenticated
  WITH CHECK (created_by = (SELECT auth.uid()));
DROP POLICY IF EXISTS npc_creator_runtime_contract_overrides_update_own ON public.npc_creator_runtime_contract_overrides;
CREATE POLICY npc_creator_runtime_contract_overrides_update_own
  ON public.npc_creator_runtime_contract_overrides FOR UPDATE TO authenticated
  USING (created_by = (SELECT auth.uid()))
  WITH CHECK (created_by = (SELECT auth.uid()));

REVOKE ALL ON TABLE public.npc_creator_runtime_contract_overrides FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.npc_creator_runtime_contract_overrides TO authenticated;

DROP TRIGGER IF EXISTS trg_npc_creator_runtime_contract_overrides_updated_at ON public.npc_creator_runtime_contract_overrides;
CREATE TRIGGER trg_npc_creator_runtime_contract_overrides_updated_at
  BEFORE UPDATE ON public.npc_creator_runtime_contract_overrides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
