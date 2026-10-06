import { describe, expect, it } from "vitest";
import { buildScales } from "../palettes";
import { shadcnTokens } from "../semantic";
import { wcagRatio } from "../contrast";
import { exportScales } from "../export";
import { DEFAULT_STATE } from "../state";

const PAIRS: [string, string][] = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["primary-foreground", "primary"],
  ["secondary-foreground", "secondary"],
  ["muted-foreground", "muted"],
  ["accent-foreground", "accent"],
  ["destructive-foreground", "destructive"],
];
const BASES = ["#3b82f6", "#10b981", "#f59e0b", "#facc15", "#f43f5e", "#8b5cf6", "#1e3a8a", "#2f8f6b", "#0ea5e9", "#a3e635", "#6b7280", "#ec4899"];

describe("shadcnTokens", () => {
  for (const theme of ["light", "dark"] as const) {
    it(`every text/background pair reaches AA in ${theme}`, () => {
      for (const base of BASES) {
        const t = shadcnTokens(buildScales({ ...DEFAULT_STATE, base }), theme);
        for (const [fg, bg] of PAIRS) expect(wcagRatio(t[fg]!, t[bg]!), `${base} ${theme} ${fg}/${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
  it("throws a clear error when scales are missing", () => {
    expect(() => shadcnTokens(buildScales({ ...DEFAULT_STATE, neutral: "off", status: false }), "light")).toThrow(/Missing scale/);
  });
});

describe("shadcn export", () => {
  const css = exportScales(buildScales(DEFAULT_STATE), { format: "shadcn", syntax: "oklch" });
  it("has light, dark and theme mapping blocks", () => {
    expect(css).toContain(":root {");
    expect(css).toContain(".dark {");
    expect(css).toContain("@theme inline {");
    expect(css).toContain("--color-primary: var(--primary);");
    expect(css).toMatch(/--primary: oklch\(/);
  });
  it("degrades gracefully without the full set", () => {
    expect(exportScales(buildScales({ ...DEFAULT_STATE, status: false }), { format: "shadcn", syntax: "hex" })).toContain("needs the brand");
  });
  it("snapshot", () => expect(css).toMatchSnapshot());
});
