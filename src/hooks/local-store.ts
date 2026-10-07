"use client";

/**
 * Moves a value saved under an old key to the new one, once. The old entry is removed only after
 * the new one is written, so nothing is lost if storage fails halfway.
 */
export function migrateLocalKey(oldKey: string, newKey: string): void {
  try {
    if (localStorage.getItem(newKey) !== null) return;
    const old = localStorage.getItem(oldKey);
    if (old === null) return;
    localStorage.setItem(newKey, old);
    localStorage.removeItem(oldKey);
  } catch {}
}

/** Minimal localStorage-backed external store for useSyncExternalStore. `legacyKey` is migrated on first read. */
export function createLocalStore(key: string, fallback: string, legacyKey?: string) {
  const event = `shadely:${key}`;
  return {
    subscribe(cb: () => void) {
      const onStorage = (e: StorageEvent) => (e.key === key || e.key === null) && cb();
      window.addEventListener("storage", onStorage);
      window.addEventListener(event, cb);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(event, cb);
      };
    },
    get(): string {
      if (legacyKey) migrateLocalKey(legacyKey, key);
      try {
        return localStorage.getItem(key) ?? fallback;
      } catch {
        return fallback;
      }
    },
    set(value: string) {
      try {
        localStorage.setItem(key, value);
      } catch {}
      window.dispatchEvent(new Event(event));
    },
  };
}
