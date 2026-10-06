import { describe, expect, it } from "vitest";
import { deltaE, simulateVision, visionFilterValues, visionMatrix, VISION_MODES, visionPairs } from "../cvd";
import { bestText, contrastMatrix, paletteText, scorePair, THRESHOLDS } from "../contrast";
import { generateScale } from "../scale";

describe("color-vision simulation", () => {
  it("leaves white, black and grays unchanged for the dichromacies", () => {
    for (const mode of ["protanopia", "deuteranopia", "tritanopia"] as const)
      for (const hex of ["#ffffff", "#000000", "#808080"]) {
        const out = simulateVision(hex, mode);
        for (let i = 1; i < 7; i += 2) expect(Math.abs(parseInt(out.slice(i, i + 2), 16) - parseInt(hex.slice(i, i + 2), 16))).toBeLessThanOrEqual(2);
      }
  });
  it("matrix rows sum to 1 for dichromacies (neutral axis preserved)", () => {
    for (const mode of ["protanopia", "deuteranopia", "tritanopia"] as const)
      for (const row of visionMatrix(mode)) expect(row[0] + row[1] + row[2]).toBeCloseTo(1, 4);
  });
  it("achromatopsia returns grays", () => {
    const out = simulateVision("#ff0000", "achromatopsia");
    expect(out.slice(1, 3)).toBe(out.slice(3, 5));
    expect(out.slice(3, 5)).toBe(out.slice(5, 7));
  });
  it("normal vision is the identity", () => {
    expect(simulateVision("#3b82f6", "normal")).toBe("#3b82f6");
    expect(visionFilterValues("normal").split(" ")).toHaveLength(20);
  });
  it("red and green become hard to tell apart for red-green deficiencies, red and blue do not", () => {
    for (const mode of ["protanopia", "deuteranopia"] as const) {
      const rg = deltaE(simulateVision("#d03030", mode), simulateVision("#2f9a3f", mode));
      const rb = deltaE(simulateVision("#d03030", mode), simulateVision("#2f50d0", mode));
      expect(rg, mode).toBeLessThan(rb);
      expect(rg, mode).toBeLessThan(deltaE("#d03030", "#2f9a3f") * 0.6);
    }
  });
  it("visionPairs sorts by distance and classifies", () => {
    const pairs = visionPairs([{ name: "red", hex: "#d03030" }, { name: "green", hex: "#2f9a3f" }, { name: "blue", hex: "#2f50d0" }], "deuteranopia");
    expect(pairs).toHaveLength(3);
    expect(pairs[0]!.distance).toBeLessThanOrEqual(pairs[1]!.distance);
    expect(`${pairs[0]!.a}-${pairs[0]!.b}`).toBe("red-green");
    expect(["close", "confusable"]).toContain(pairs[0]!.level);
  });
  it("exposes all modes", () => expect(VISION_MODES).toHaveLength(5));
});

describe("contrast usage thresholds", () => {
  it("large text and UI accept 3:1 where body text does not", () => {
    // #959595 on white is about 2.9; #8a8a8a is about 3.4.
    expect(scorePair("#8a8a8a", "#ffffff", "wcag", "body").pass).toBe(false);
    expect(scorePair("#8a8a8a", "#ffffff", "wcag", "large").pass).toBe(true);
    expect(scorePair("#8a8a8a", "#ffffff", "wcag", "ui").pass).toBe(true);
  });
  it("thresholds are monotone and body is the default", () => {
    for (const m of ["wcag", "apca"] as const) expect(THRESHOLDS[m].body).toBeGreaterThan(THRESHOLDS[m].large);
    expect(scorePair("#777", "#fff", "wcag")).toEqual(scorePair("#777", "#fff", "wcag", "body"));
  });
  it("matrix passes more pairs for lenient usages", () => {
    const hexes = generateScale("#3b82f6").map((s) => s.hex);
    const count = (u: "body" | "large" | "ui") => contrastMatrix(hexes, "wcag", u).flat().filter((c) => c.pass).length;
    expect(count("large")).toBeGreaterThan(count("body"));
  });
});

describe("paletteText", () => {
  const steps = generateScale("#3b82f6");
  it("picks the lowest-contrast passing palette step (tinted text, not black)", () => {
    const bg = steps.find((s) => s.stop === 100)!.hex;
    const pick = paletteText(steps, bg)!;
    expect(pick.score.pass).toBe(true);
    expect(pick.step.stop).toBeGreaterThanOrEqual(600);
    expect(pick.score.value).toBeLessThan(bestText(bg).score.value);
  });
  it("returns null when nothing in the scale passes", () => {
    expect(paletteText(steps.slice(5, 7), steps[6]!.hex, "wcag", "body")).toBeNull();
  });
});
