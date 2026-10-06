import { describe, expect, it } from "vitest";
import { generateScale } from "../scale";
import { gamutMap, inGamut } from "../gamut";
import { hexToOklch, oklchToLinearSrgb, rgb8ToHex } from "../color-space";
import { STOPS } from "../types";

const EDGE = ["#000000", "#ffffff", "#808080", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#facc15", "#1e3a8a", "#f5f5f4", "#010203", "#3b82f6", "#f49d0c"];

function seeded(n: number): string[] {
  let seed = 987654321;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32;
  return Array.from({ length: n }, () => rgb8ToHex([Math.floor(rnd() * 256), Math.floor(rnd() * 256), Math.floor(rnd() * 256)]));
}
const ALL = [...EDGE, ...seeded(500)];

describe("gamutMap", () => {
  it("keeps in-gamut colors untouched", () => {
    const o = hexToOklch("#3b82f6")!;
    const r = gamutMap(o);
    expect(r.clipped).toBe(false);
    expect(r.oklch).toEqual(o);
  });
  it("reduces chroma at constant L/H for out-of-gamut colors", () => {
    const r = gamutMap({ l: 0.9, c: 0.35, h: 140 });
    expect(r.clipped).toBe(true);
    expect(inGamut(r.rgb)).toBe(true);
    expect(r.oklch.c).toBeLessThan(0.35);
    expect(Math.abs(r.oklch.l - 0.9)).toBeLessThan(0.03);
    expect(Math.abs(r.oklch.h - 140)).toBeLessThan(6);
  });
  it("p3 holds more chroma than srgb", () => {
    const o = { l: 0.7, c: 0.3, h: 150 };
    expect(gamutMap(o, "p3").oklch.c).toBeGreaterThan(gamutMap(o, "srgb").oklch.c);
  });
});

describe("generateScale properties", () => {
  it("returns 11 valid, ascending stops", () => {
    for (const hex of ALL) {
      const s = generateScale(hex);
      expect(s.map((x) => x.stop)).toEqual([...STOPS]);
      for (const step of s) expect(step.hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("pins the base color exactly at one anchor stop", () => {
    for (const hex of ALL) {
      const anchors = generateScale(hex).filter((x) => x.isAnchor);
      expect(anchors).toHaveLength(1);
      expect(anchors[0]!.hex).toBe(hex);
    }
  });

  it("lightness never increases toward darker stops", () => {
    for (const hex of ALL) {
      const s = generateScale(hex);
      for (let i = 1; i < s.length; i++) {
        expect(s[i]!.oklch.l, `${hex} ${s[i]!.stop}`).toBeLessThanOrEqual(s[i - 1]!.oklch.l + 0.004);
      }
    }
  });

  it("keeps hue for chromatic steps (no shift)", () => {
    for (const hex of ALL) {
      const base = hexToOklch(hex)!;
      if (base.c < 0.04) continue;
      for (const step of generateScale(hex)) {
        if (step.oklch.c < 0.04) continue;
        const d = Math.abs(((step.oklch.h - base.h + 540) % 360) - 180);
        expect(d, `${hex} ${step.stop}`).toBeLessThan(5);
      }
    }
  });

  it("chroma bell: lightest steps are much paler than the peak", () => {
    const s = generateScale("#3b82f6");
    const peak = Math.max(...s.map((x) => x.oklch.c));
    expect(s[0]!.oklch.c).toBeLessThan(peak * 0.25);
    expect(s[10]!.oklch.c).toBeLessThan(peak);
  });

  it("is deterministic and idempotent", () => {
    for (const hex of EDGE) {
      const a = generateScale(hex);
      expect(generateScale(hex)).toEqual(a);
      const anchor = a.find((x) => x.isAnchor)!;
      expect(generateScale(anchor.hex).map((x) => x.hex)).toEqual(a.map((x) => x.hex));
    }
  });

  it("does not force the base to 500", () => {
    expect(generateScale("#facc15").find((x) => x.isAnchor)!.stop).toBeLessThan(500);
    expect(generateScale("#1e3a8a").find((x) => x.isAnchor)!.stop).toBeGreaterThan(500);
    expect(generateScale("#3b82f6").find((x) => x.isAnchor)!.stop).toBe(500);
  });

  it("honours an explicit anchor", () => {
    const s = generateScale("#3b82f6", { anchor: 600 });
    expect(s.find((x) => x.isAnchor)!.stop).toBe(600);
    expect(s[6]!.hex).toBe("#3b82f6");
  });

  it("p3 mode keeps wide-gamut chroma while hex stays an sRGB fallback", () => {
    const wide = { l: 0.7, c: 0.3, h: 150 };
    const srgb = generateScale(wide);
    const p3 = generateScale(wide, { gamut: "p3" });
    expect(p3.find((x) => x.isAnchor)!.oklch.c).toBeGreaterThan(srgb.find((x) => x.isAnchor)!.oklch.c);
    for (const x of p3) expect(x.hex).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("all srgb steps are in gamut", () => {
    for (const hex of EDGE) for (const s of generateScale(hex)) expect(inGamut(oklchToLinearSrgb(s.oklch), 2e-3)).toBe(true);
  });

  it("throws on invalid input", () => {
    expect(() => generateScale("banana")).toThrow();
  });
});

describe("reference scales (snapshot of hexes)", () => {
  it("blue", () => expect(generateScale("#3b82f6").map((s) => s.hex)).toMatchSnapshot());
  it("amber", () => expect(generateScale("#f59e0b").map((s) => s.hex)).toMatchSnapshot());
  it("emerald", () => expect(generateScale("#10b981").map((s) => s.hex)).toMatchSnapshot());
  it("rose", () => expect(generateScale("#f43f5e").map((s) => s.hex)).toMatchSnapshot());
  it("violet", () => expect(generateScale("#8b5cf6").map((s) => s.hex)).toMatchSnapshot());
  it("yellow", () => expect(generateScale("#facc15").map((s) => s.hex)).toMatchSnapshot());
  it("gray", () => expect(generateScale("#6b7280").map((s) => s.hex)).toMatchSnapshot());
  it("near-white", () => expect(generateScale("#fafaf9").map((s) => s.hex)).toMatchSnapshot());
  it("near-black", () => expect(generateScale("#0a0a0a").map((s) => s.hex)).toMatchSnapshot());
});

describe("overrides (lock and edit shades)", () => {
  const base = "#3b82f6";
  it("pins overridden stops exactly and flags them", () => {
    const s = generateScale(base, { overrides: { 300: "#aabbcc", 800: "#112244" } });
    expect(s.find((x) => x.stop === 300)!.hex).toBe("#aabbcc");
    expect(s.find((x) => x.stop === 800)!.hex).toBe("#112244");
    expect(s.filter((x) => x.isOverride).map((x) => x.stop)).toEqual([300, 800]);
    expect(s.find((x) => x.isAnchor)!.hex).toBe(base);
  });
  it("re-flows the other stops around the pinned ones", () => {
    const plain = generateScale(base);
    const pinned = generateScale(base, { overrides: { 300: "#9fb7e8" } });
    expect(pinned.find((x) => x.stop === 200)!.hex).not.toBe(plain.find((x) => x.stop === 200)!.hex);
  });
  it("keeps lightness ordered when overrides are ordered", () => {
    const s = generateScale(base, { overrides: { 200: "#c9d7f3", 700: "#1b4fb0" } });
    for (let i = 1; i < s.length; i++) expect(s[i]!.oklch.l).toBeLessThanOrEqual(s[i - 1]!.oklch.l + 0.004);
  });
  it("ignores an override on the anchor stop and invalid hexes", () => {
    const a = generateScale(base, { overrides: { 500: "#000000", 100: "nope" } as never });
    expect(a).toEqual(generateScale(base).map((x) => ({ ...x })));
  });
  it("pinning every stop to the generated value changes nothing visible", () => {
    const plain = generateScale(base);
    const all = Object.fromEntries(plain.map((x) => [x.stop, x.hex]));
    expect(generateScale(base, { overrides: all }).map((x) => x.hex)).toEqual(plain.map((x) => x.hex));
  });
});

describe("explicit anchor", () => {
  it("lands the base on any stop and stays ordered", () => {
    for (const stop of [50, 100, 300, 500, 700, 900, 950] as const) {
      const s = generateScale("#3b82f6", { anchor: stop });
      expect(s.find((x) => x.isAnchor)!.stop).toBe(stop);
      for (let i = 1; i < s.length; i++) expect(s[i]!.oklch.l, `${stop}/${i}`).toBeLessThanOrEqual(s[i - 1]!.oklch.l + 0.01);
    }
  });
});
