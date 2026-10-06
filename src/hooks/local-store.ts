"use client";

/** Minimal localStorage-backed external store for useSyncExternalStore. */
export function createLocalStore(key: string, fallback: string) {
  const event = `tintwork:${key}`;
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
