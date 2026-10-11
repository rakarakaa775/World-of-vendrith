#!/usr/bin/env bash
set -euo pipefail

# Database is the disposable Postgres service provisioned by GitHub Actions.
psql -X -v ON_ERROR_STOP=1 -q -c "select test_support.seed_case();"

(
  psql -X -v ON_ERROR_STOP=1 -qAt > /tmp/atomic-save-first.log <<'SQL'
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',false);
select set_config('test.fail_at','',false);
begin;
select public.map_editor_save_game_slot_atomic_v1(
  '11111111-1111-1111-1111-111111111111', 1, test_support.world_envelope('Concurrent First'),
  '22222222-2222-2222-2222-222222222222', 1, test_support.exterior_envelope('Concurrent First Exterior'),
  1::smallint, 'Concurrent First', test_support.game_save('Concurrent First','Concurrent First Exterior')
);
select pg_sleep(2);
commit;
SQL
) &
first_pid=$!

# The first transaction holds the World lock while the second request begins.
sleep 0.25
psql -X -v ON_ERROR_STOP=1 -qAt > /tmp/atomic-save-second.log <<'SQL'
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',false);
select set_config('test.fail_at','',false);
select public.map_editor_save_game_slot_atomic_v1(
  '11111111-1111-1111-1111-111111111111', 1, test_support.world_envelope('Concurrent Second'),
  '22222222-2222-2222-2222-222222222222', 1, test_support.exterior_envelope('Concurrent Second Exterior'),
  1::smallint, 'Concurrent Second', test_support.game_save('Concurrent Second','Concurrent Second Exterior')
);
SQL
wait "$first_pid"

if ! grep -q '"ok": true' /tmp/atomic-save-first.log; then
  cat /tmp/atomic-save-first.log
  echo "first concurrent save did not commit" >&2
  exit 1
fi
if ! grep -q '"code": "VERSION_CONFLICT"' /tmp/atomic-save-second.log; then
  cat /tmp/atomic-save-second.log
  echo "second concurrent save did not detect the stale baseline" >&2
  exit 1
fi

psql -X -v ON_ERROR_STOP=1 -q <<'SQL'
select test_support.assert_true((select count(*)=2 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'concurrent saves must commit exactly one World version');
select test_support.assert_true((select count(*)=2 from public.editor_map_versions where editor_map_id='22222222-2222-2222-2222-222222222222'),'concurrent saves must commit exactly one Exterior version');
select test_support.assert_true((select snapshot=test_support.game_save('Concurrent First','Concurrent First Exterior') from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1),'slot must reflect the winning transaction only');
SQL

echo "atomic Save Slot concurrency test passed"
