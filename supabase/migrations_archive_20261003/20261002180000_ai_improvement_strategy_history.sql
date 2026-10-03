alter table public.ai_improvement_proposals add column if not exists strategy_description text;
alter table public.ai_improvement_proposals add column if not exists strategy_steps jsonb not null default '[]'::jsonb;
