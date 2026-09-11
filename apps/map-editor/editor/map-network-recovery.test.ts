import { describe, expect, it } from 'vitest';
import { createPersistenceQueue } from './map-network-recovery';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
  };
}

describe('createPersistenceQueue', () => {
  it('persists pending payloads in order', () => {
    const queue = createPersistenceQueue<string>(memoryStorage(), 'test.queue');
    const first = queue.enqueue('first');
    const second = queue.enqueue('second');

    expect(queue.list().map((entry) => entry.payload)).toEqual(['first', 'second']);
    expect(queue.peek()?.id).toBe(first);

    queue.remove(first);
    expect(queue.peek()?.id).toBe(second);
  });

  it('clears all pending payloads', () => {
    const queue = createPersistenceQueue(memoryStorage(), 'test.queue');
    queue.enqueue('payload');
    queue.clear();
    expect(queue.list()).toEqual([]);
    expect(queue.peek()).toBeNull();
  });
});
