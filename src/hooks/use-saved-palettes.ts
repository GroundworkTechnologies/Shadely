"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { createLocalStore } from "./local-store";

export interface SavedPalette {
  id: string;
  name: string;
  /** Encoded PaletteState query string (no leading ?). */
  query: string;
  base: string;
  createdAt: number;
}

const store = createLocalStore("tintwork:palettes:v1", "[]");

function parse(raw: string): SavedPalette[] {
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(
      (p): p is SavedPalette =>
        p && typeof p.id === "string" && typeof p.name === "string" && typeof p.query === "string" && typeof p.base === "string",
    );
  } catch {
    return [];
  }
}

export function useSavedPalettes() {
  // null on the server, a string after hydration: that difference doubles as `ready`.
  const raw = useSyncExternalStore(store.subscribe, store.get, () => null);
  const items = useMemo(() => (raw === null ? [] : parse(raw)), [raw]);

  const persist = useCallback((next: SavedPalette[]) => store.set(JSON.stringify(next)), []);

  const add = useCallback(
    (p: Omit<SavedPalette, "id" | "createdAt">) =>
      persist([{ ...p, id: crypto.randomUUID(), createdAt: Date.now() }, ...parse(store.get())]),
    [persist],
  );
  const remove = useCallback((id: string) => persist(parse(store.get()).filter((p) => p.id !== id)), [persist]);
  const rename = useCallback(
    (id: string, name: string) => persist(parse(store.get()).map((p) => (p.id === id ? { ...p, name } : p))),
    [persist],
  );
  const replaceAll = useCallback((list: SavedPalette[]) => persist(list), [persist]);

  return { items, ready: raw !== null, add, remove, rename, replaceAll };
}
