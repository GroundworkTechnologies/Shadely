import { beforeEach, describe, expect, it } from "vitest";
import { migrateLocalKey } from "../local-store";

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    data,
  };
}

describe("migrateLocalKey", () => {
  let store: ReturnType<typeof fakeStorage>;
  const install = (s: ReturnType<typeof fakeStorage>) => ((globalThis as { localStorage?: unknown }).localStorage = s);

  beforeEach(() => {
    store = fakeStorage();
    install(store);
  });

  it("moves an old value to the new key and removes the old one", () => {
    store.data.set("tintwork:palettes:v1", '[{"id":"1"}]');
    migrateLocalKey("tintwork:palettes:v1", "shadely:palettes:v1");
    expect(store.getItem("shadely:palettes:v1")).toBe('[{"id":"1"}]');
    expect(store.getItem("tintwork:palettes:v1")).toBeNull();
  });

  it("never overwrites data already saved under the new key", () => {
    store.data.set("tintwork:palettes:v1", "old");
    store.data.set("shadely:palettes:v1", "new");
    migrateLocalKey("tintwork:palettes:v1", "shadely:palettes:v1");
    expect(store.getItem("shadely:palettes:v1")).toBe("new");
  });

  it("does nothing when there is nothing to migrate, and is safe to repeat", () => {
    migrateLocalKey("a", "b");
    expect(store.getItem("b")).toBeNull();
    store.data.set("a", "x");
    migrateLocalKey("a", "b");
    migrateLocalKey("a", "b");
    expect(store.getItem("b")).toBe("x");
  });

  it("does not throw when storage is unavailable", () => {
    install({ getItem: () => { throw new Error("blocked"); }, setItem: () => {}, removeItem: () => {} } as never);
    expect(() => migrateLocalKey("a", "b")).not.toThrow();
  });
});
