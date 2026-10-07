import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PAGES } from "../seo";

const pages = Object.entries(PAGES);

/** SEO.md rules, checked for every page. */
describe("page SEO (SEO.md)", () => {
  it.each(pages)("%s: title is 'Shadely: Tagline' and short enough", (_k, p) => {
    expect(p.title).toMatch(/^Shadely: .+/);
    expect(p.title.length).toBeLessThanOrEqual(60);
  });
  it.each(pages)("%s: description is under 160 characters", (_k, p) => {
    expect(p.description.length).toBeGreaterThan(70);
    expect(p.description.length).toBeLessThanOrEqual(160);
  });
  it.each(pages)("%s: one primary keyword, present in the title or description", (_k, p) => {
    const hay = `${p.title} ${p.description}`.toLowerCase();
    const words = p.keyword.toLowerCase().split(" ");
    expect(words.every((w) => hay.includes(w)), p.keyword).toBe(true);
  });
  it("no duplicate titles, descriptions or paths", () => {
    for (const field of ["title", "description", "path"] as const) {
      const values = pages.map(([, p]) => p[field]);
      expect(new Set(values).size, field).toBe(values.length);
    }
  });
  it("paths are short, lowercase, hyphenated", () => {
    for (const [, p] of pages) expect(p.path).toMatch(/^\/[a-z0-9-]*$/);
  });
  it("only the saved-palettes page is kept out of search", () => {
    expect(pages.filter(([, p]) => !p.index).map(([k]) => k)).toEqual(["palettes"]);
  });
});

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "__tests__" ? [] : sourceFiles(full);
    return /\.(tsx?|css)$/.test(e.name) ? [full] : [];
  });
}

describe("copy rules (COPY.md)", () => {
  const files = sourceFiles(path.join(process.cwd(), "src")).map((f) => [path.relative(process.cwd(), f), readFileSync(f, "utf8")] as const);
  it("uses no em dashes in the app", () => {
    expect(files.filter(([, s]) => s.includes("—")).map(([f]) => f)).toEqual([]);
  });
  it("makes no invented numeric claims about customers", () => {
    expect(files.filter(([, s]) => /\d[\d,.]*\+?\s+(happy |active )?(customers|teams|users|companies)/i.test(s)).map(([f]) => f)).toEqual([]);
  });
  it("has no 'it's not X, it's Y' sentences", () => {
    expect(files.filter(([, s]) => /(it'?s|it is) not (just )?[^.]{1,40}, (it'?s|it is)/i.test(s)).map(([f]) => f)).toEqual([]);
  });
});

describe("product name", () => {
  it("the old name only survives in the storage migration", () => {
    const allowed = new Set(["src/hooks/use-saved-palettes.ts", "src/components/site/theme-toggle.tsx", "src/hooks/__tests__/local-store.test.ts"]);
    const files = sourceFiles(path.join(process.cwd(), "src"));
    const hits = files.map((f) => path.relative(process.cwd(), f)).filter((f) => !allowed.has(f) && /tintwork/i.test(readFileSync(f, "utf8")));
    expect(hits).toEqual([]);
  });
});
