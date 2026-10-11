/**
 * Keep Load Slot state adoption behind all asynchronous integrity gates.
 *
 * The editor's current document must remain untouched when snapshot validation
 * or slot-list refresh fails. Callers perform reads/parsing in prepare(), then
 * refresh authoritative slot metadata, and only then adopt the prepared state.
 */
export async function prepareRefreshThenCommit<T>(
  prepare: () => Promise<T>,
  refresh: () => Promise<unknown>,
  commit: (prepared: T) => void,
): Promise<T> {
  const prepared = await prepare();
  await refresh();
  commit(prepared);
  return prepared;
}
