export type PendingPersistence<T> = {
  id: string;
  payload: T;
  createdAt: string;
};

export interface PersistenceQueue<T> {
  enqueue(payload: T): string;
  peek(): PendingPersistence<T> | null;
  remove(id: string): void;
  list(): PendingPersistence<T>[];
  clear(): void;
}

export function createPersistenceQueue<T>(
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = globalThis.localStorage,
  storageKey = 'vandrith.map-editor.pending-persistence',
): PersistenceQueue<T> {
  const read = (): PendingPersistence<T>[] => {
    const raw = storage.getItem(storageKey);
    if (!raw) return [];
    try {
      const value = JSON.parse(raw) as PendingPersistence<T>[];
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };

  const write = (entries: PendingPersistence<T>[]) => {
    storage.setItem(storageKey, JSON.stringify(entries));
  };

  return {
    enqueue(payload) {
      const entry: PendingPersistence<T> = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        payload,
        createdAt: new Date().toISOString(),
      };
      write([...read(), entry]);
      return entry.id;
    },
    peek() {
      return read()[0] ?? null;
    },
    remove(id) {
      write(read().filter((entry) => entry.id !== id));
    },
    list() {
      return read();
    },
    clear() {
      storage.removeItem(storageKey);
    },
  };
}
