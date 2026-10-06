import { describe, expect, it } from "vitest";
import { converter, formatHex as culoriHex } from "culori";
import { hexToOklch, oklchToHex, rgb8ToHex } from "../color-space";
import { parseColor } from "../parse";
import { formatOklch, formatHsl } from "../format";

const toOklch = converter("oklch");

describe("hex <-> oklch", () => {
  const known: [string, number, number, number | null][] = [
    ["#ffffff", 1, 0, null],
    ["#000000", 0, 0, null],
    ["#ff0000", 0.628, 0.258, 29.23],
    ["#00ff00", 0.866, 0.295, 142.5],
    ["#0000ff", 0.452, 0.313, 264.05],
  ];
  it.each(known)("%s", (hex, l, c, h) => {
    const o = hexToOklch(hex)!;
    expect(o.l).toBeCloseTo(l, 2);
    expect(o.c).toBeCloseTo(c, 2);
    if (h !== null) expect(Math.abs(o.h - h)).toBeLessThan(0.5);
  });

  it("matches culori on a stratified grid", () => {
    for (let r = 0; r < 256; r += 51)
      for (let g = 0; g < 256; g += 51)
        for (let b = 0; b < 256; b += 51) {
          const hex = rgb8ToHex([r, g, b]);
          const mine = hexToOklch(hex)!;
          const ref = toOklch(hex)!;
          expect(mine.l).toBeCloseTo(ref.l, 3);
          expect(mine.c).toBeCloseTo(ref.c, 3);
          if (ref.c > 0.01) expect(Math.abs(mine.h - (ref.h ?? 0))).toBeLessThan(0.5);
        }
  });

  it("round-trips hex exactly", () => {
    let seed = 12345;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32;
    for (let i = 0; i < 1000; i++) {
      const hex = rgb8ToHex([Math.floor(rnd() * 256), Math.floor(rnd() * 256), Math.floor(rnd() * 256)]);
      expect(oklchToHex(hexToOklch(hex)!)).toBe(hex);
      expect(culoriHex(hex)).toBe(hex);
    }
  });
});

describe("parseColor / format", () => {
  it("parses common syntaxes", () => {
    expect(parseColor("#3B82F6")).toEqual(hexToOklch("#3b82f6"));
    expect(parseColor("3b82f6")).toEqual(hexToOklch("#3b82f6"));
    expect(parseColor("#fff")).toEqual(hexToOklch("#ffffff"));
    expect(oklchToHex(parseColor("rgb(59 130 246)")!)).toBe("#3b82f6");
    expect(oklchToHex(parseColor("hsl(217 91% 60%)")!)).toBe(culoriHex("hsl(217 91% 60%)"));
    expect(parseColor("oklch(62.3% 0.214 259.815)")!.l).toBeCloseTo(0.623, 3);
  });
  it("rejects garbage", () => {
    for (const s of ["", "nope", "#12", "#gggggg", "rgb(1,2)", "oklch(2 0 0)"]) expect(parseColor(s)).toBeNull();
  });
  it("formats", () => {
    expect(formatOklch({ l: 0.6230001, c: 0.21400001, h: 259.8 })).toBe("oklch(62.3% 0.214 259.8)");
    expect(formatHsl("#3b82f6")).toBe("hsl(217 91% 60%)");
  });
});
