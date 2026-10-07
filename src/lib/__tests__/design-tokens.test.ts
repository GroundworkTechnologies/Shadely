import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { gamutMap, oklchToHex, parseColor, wcagRatio } from "@/engine";

const css = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

function tokens(selector: ":root" | ".dark"): Record<string, string> {
  const re = new RegExp(`^${selector.replace(".", "\\.")} \\{([^}]*)\\}`, "m");
  const block = re.exec(css)?.[1] ?? "";
  const out: Record<string, string> = {};
  for (const m of block.matchAll(/--([a-z-]+):\s*(oklch\([^)]+\));/g)) {
    const o = parseColor(m[2]!);
    if (o) out[m[1]!] = oklchToHex(gamutMap(o).oklch);
  }
  return out;
}

// [foreground token, background token, minimum ratio, why]
const TEXT: [string, string, number][] = [
  ["foreground", "background", 4.5],
  ["foreground", "surface", 4.5],
  ["foreground", "surface-muted", 4.5],
  ["foreground", "surface-hover", 4.5],
  ["muted-foreground", "background", 4.5],
  ["muted-foreground", "surface", 4.5],
  ["muted-foreground", "surface-muted", 4.5],
  ["muted-foreground", "surface-hover", 4.5],
  ["primary-foreground", "primary", 4.5],
  ["primary-foreground", "primary-hover", 4.5],
  ["danger-text", "background", 4.5],
  ["danger-text", "surface", 4.5],
  // Non-text (WCAG 1.4.11): input borders, focus ring.
  ["border-control", "background", 3],
  ["border-control", "surface", 3],
  ["ring", "background", 3],
  ["ring", "surface", 3],
];

describe.each([":root", ".dark"] as const)("design tokens in %s", (sel) => {
  const t = tokens(sel);
  it("defines every token the pairs need", () => {
    for (const [a, b] of TEXT) {
      expect(t[a], `${sel} --${a}`).toBeDefined();
      expect(t[b], `${sel} --${b}`).toBeDefined();
    }
  });
  it.each(TEXT)("%s on %s reaches %s:1", (fg, bg, min) => {
    expect(wcagRatio(t[fg]!, t[bg]!)).toBeGreaterThanOrEqual(min);
  });
});

describe("typography rules", () => {
  it("loads Inter with only the three allowed weights (400, 500, 600)", () => {
    const layout = readFileSync(path.join(process.cwd(), "src/app/layout.tsx"), "utf8");
    expect(layout).toMatch(/weight: \["400", "500", "600"\]/);
    expect(layout).not.toMatch(/Geist|Roboto|Mono\(/);
  });
  it("uses no weight classes outside normal, medium and semibold", () => {
    const bad = /font-(thin|extralight|light|bold|extrabold|black)\b/;
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) return e.name === "__tests__" ? [] : walk(full);
        return /\.(tsx?|css)$/.test(e.name) ? [full] : [];
      });
    const offenders = walk(path.join(process.cwd(), "src")).filter((f) => bad.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });
});
