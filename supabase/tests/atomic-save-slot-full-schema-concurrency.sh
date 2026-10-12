#!/usr/bin/env bash
set -euo pipefail

# Disposable PostgreSQL CI database only.
psql -X -v ON_ERROR_STOP=1 -q -c "select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',false); select set_config('test.fail_at','',false); select atomic_save_slot_test.seed_case();"

(
  psql -X -v ON_ERROR_STOP=1 -qAt > /tmp/atomic-full-first.log <<'SQL'
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',false);
select set_config('test.fail_at','',false);
begin;
select public.map_editor_save_game_slot_atomic_v1(
  '11111111-1111-1111-1111-111111111111',1,atomic_save_slot_test.world_envelope('Concurrent First'),
  '22222222-2222-2222-2222-222222222222',1,atomic_save_slot_test.exterior_envelope('Concurrent First Exterior'),
  1::smallint,'Concurrent First',atomic_save_slot_test.game_save('Concurrent First','Concurrent First Exterior')
);
select pg_sleep(2);
commit;
SQL
) &
first_pid=$!

# Wait until the first RPC has returned success and is holding its transaction open.
# Its parent Region FOR SHARE lock must prevent a concurrent UPDATE until COMMIT.
for attempt in $(seq 1 100); do
  if grep -q '"ok": true' /tmp/atomic-full-first.log; then break; fi
  sleep 0.05
done
if ! grep -q '"ok": true' /tmp/atomic-full-first.log; then
  cat /tmp/atomic-full-first.log
  echo "first full-schema concurrent save did not reach the lock-hold window" >&2
  exit 1
fi

if psql -X -v ON_ERROR_STOP=1 -q > /tmp/atomic-full-parent-lock.log 2>&1 <<'SQL'
set lock_timeout = '300ms';
update public.editor_map_identity
set map_type = 'region'
where editor_map_id = '33333333-3333-3333-3333-333333333333';
SQL
then
  echo "concurrent parent Region UPDATE unexpectedly succeeded while Save Slot held FOR SHARE" >&2
  exit 1
fi
if ! grep -qi 'lock timeout' /tmp/atomic-full-parent-lock.log; then
  cat /tmp/atomic-full-parent-lock.log
  echo "parent Region UPDATE failed for a reason other than the expected lock timeout" >&2
  exit 1
fi

psql -X -v ON_ERROR_STOP=1 -qAt > /tmp/atomic-full-second.log <<'SQL'
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',false);
select set_config('test.fail_at','',false);
select public.map_editor_save_game_slot_atomic_v1(
  '11111111-1111-1111-1111-111111111111',1,atomic_save_slot_test.world_envelope('Concurrent Second'),
  '22222222-2222-2222-2222-222222222222',1,atomic_save_slot_test.exterior_envelope('Concurrent Second Exterior'),
  1::smallint,'Concurrent Second',atomic_save_slot_test.game_save('Concurrent Second','Concurrent Second Exterior')
);
SQL
wait "$first_pid"

if ! grep -q '"ok": true' /tmp/atomic-full-first.log; then
  cat /tmp/atomic-full-first.log
  echo "first full-schema concurrent save did not commit" >&2
  exit 1
fi
if ! grep -q '"code": "VERSION_CONFLICT"' /tmp/atomic-full-second.log; then
  cat /tmp/atomic-full-second.log
  echo "second full-schema concurrent save did not conflict" >&2
  exit 1
fi

psql -X -v ON_ERROR_STOP=1 -q <<'SQL'
select atomic_save_slot_test.assert_true((select count(*)=2 from public.map_versions where map_id='11111111-1111-1111-1111-111111111111'),'exactly one concurrent World version should commit');
select atomic_save_slot_test.assert_true((select count(*)=2 from public.editor_map_versions where editor_map_id='22222222-2222-2222-2222-222222222222'),'exactly one concurrent Playable version should commit');
select atomic_save_slot_test.assert_true((select snapshot=atomic_save_slot_test.game_save('Concurrent First','Concurrent First Exterior') from public.map_editor_save_slots where map_id='11111111-1111-1111-1111-111111111111' and slot_number=1),'slot must reflect the winning transaction');
SQL

echo "atomic Save Slot full-schema concurrency test passed"
