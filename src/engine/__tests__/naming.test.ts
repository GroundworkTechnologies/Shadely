import { describe, expect, it } from "vitest";
import { colorName } from "../naming";
import { generateScale } from "../scale";

describe("colorName: family", () => {
  it.each([
    ["#505cc6", "Indigo"],
    ["#3b82f6", "Blue"],
    ["#f43f5e", "Rose"],
    ["#ef4444", "Red"],
    ["#10b981", "Emerald"],
    ["#22c55e", "Green"],
    ["#f59e0b", "Amber"],
    ["#eab308", "Yellow"],
    ["#06b6d4", "Cyan"],
    ["#0ea5e9", "Sky"],
    ["#8b5cf6", "Violet"],
    ["#a855f7", "Purple"],
    ["#d946ef", "Fuchsia"],
    ["#ec4899", "Pink"],
    ["#f97316", "Orange"],
    ["#14b8a6", "Teal"],
    ["#84cc16", "Lime"],
  ])("%s is %s", (hex, family) => expect(colorName(hex).family).toBe(family));

  it("names low-chroma colors as neutrals", () => {
    expect(colorName("#6b7280").family).toBe("Gray");
    expect(colorName("#737373").family).toBe("Neutral");
    expect(colorName("#78716c").family).toBe("Stone");
    expect(colorName("#ffffff").family).toBe("White");
    expect(colorName("#000000").family).toBe("Black");
  });

  it("is stable across the lightness range of one hue", () => {
    for (const step of generateScale("#3b82f6").filter((s) => s.stop >= 300 && s.stop <= 800)) {
      expect(colorName(step.hex).family, `${step.stop}`).toBe("Blue");
    }
  });
});

describe("colorName: specific", () => {
  it.each([
    ["#ff0000", "Red"],
    ["#000080", "Navy"],
    ["#663399", "Rebecca Purple"],
    ["#6a5acd", "Slate Blue"],
    ["#ffffff", "White"],
  ])("%s is nearest %s", (hex, name) => expect(colorName(hex).specific).toBe(name));

  it("slug is kebab-case and valid as a palette name", () => {
    for (const hex of ["#505cc6", "#6b7280", "#facc15", "#123456"]) expect(colorName(hex).slug).toMatch(/^[a-z][a-z0-9-]*$/);
  });
  it("handles Oklch input", () => {
    expect(colorName({ l: 0.585, c: 0.233, h: 277 }).family).toBe("Indigo");
  });
});
