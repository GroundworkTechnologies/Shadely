import { describe, expect, it } from "vitest";
import { apcaLc, apcaTier, bestText, contrastMatrix, formatRatio, minimumStop, wcagLevel, wcagRatio } from "../contrast";
import { generateScale } from "../scale";

describe("WCAG 2", () => {
  it("known ratios", () => {
    expect(wcagRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(wcagRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    expect(wcagRatio("#767676", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(wcagRatio("#777777", "#ffffff")).toBeLessThan(4.5);
  });
  it("is symmetric", () => {
    expect(wcagRatio("#3b82f6", "#fff")).toBe(wcagRatio("#fff", "#3b82f6"));
  });
  it("levels and display rounding never round up across a threshold", () => {
    expect(wcagLevel(7)).toBe("AAA");
    expect(wcagLevel(4.5)).toBe("AA");
    expect(wcagLevel(4.499)).toBe("AA Large");
    expect(wcagLevel(2.99)).toBe("Fail");
    expect(formatRatio(4.499)).toBe("4.49");
    expect(formatRatio(21)).toBe("21.00");
  });
});

describe("APCA", () => {
  it("matches reference extremes", () => {
    expect(apcaLc("#000000", "#ffffff")).toBeCloseTo(106.04, 1);
    expect(apcaLc("#ffffff", "#000000")).toBeCloseTo(-107.88, 1);
    expect(apcaLc("#ffffff", "#ffffff")).toBe(0);
  });
  it("is polarity aware", () => {
    expect(apcaLc("#333", "#fff")).toBeGreaterThan(0);
    expect(apcaLc("#fff", "#333")).toBeLessThan(0);
  });
  it("tiers", () => {
    expect(apcaTier(-90)).toBe("Body");
    expect(apcaTier(62)).toBe("Content");
    expect(apcaTier(5)).toBe("Fail");
  });
});

describe("helpers", () => {
  const scale = generateScale("#3b82f6");
  it("matrix is 11x11 and diagonal fails", () => {
    const m = contrastMatrix(scale.map((s) => s.hex), "wcag");
    expect(m).toHaveLength(11);
    expect(m[0]).toHaveLength(11);
    for (let i = 0; i < 11; i++) expect(m[i]![i]!.pass).toBe(false);
    expect(m[0]![10]!.pass).toBe(true);
  });
  it("bestText picks readable text", () => {
    expect(bestText("#0a244f").color).toBe("#ffffff");
    expect(bestText("#f3f7fd").color).toBe("#000000");
  });
  it("minimumStop finds first AA stop against white", () => {
    const s = minimumStop(scale, "#ffffff", "wcag", 4.5);
    expect(s).not.toBeNull();
    expect(wcagRatio(s!.hex, "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });
  it("white on 700 passes AA for typical bases", () => {
    for (const hex of ["#3b82f6", "#10b981", "#f43f5e", "#8b5cf6", "#f59e0b"]) {
      const s = generateScale(hex).find((x) => x.stop === 700)!;
      expect(wcagRatio("#ffffff", s.hex), hex).toBeGreaterThanOrEqual(4.5);
    }
  });
});
