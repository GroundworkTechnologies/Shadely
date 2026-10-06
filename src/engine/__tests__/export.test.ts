import { describe, expect, it } from "vitest";
import { buildScales } from "../palettes";
import { exportScales, type ExportFormat } from "../export";
import { DEFAULT_STATE, decodeState, encodeState, type PaletteState } from "../state";
import { converter, parse } from "culori";

const state: PaletteState = { ...DEFAULT_STATE, base: "#3b82f6" };
const scales = buildScales(state);

describe("buildScales", () => {
  it("brand + neutral + 4 status by default", () => {
    expect(scales.map((s) => s.name)).toEqual(["brand", "neutral", "success", "warning", "danger", "info"]);
    expect(buildScales({ ...state, neutral: "off", status: false })).toHaveLength(1);
  });
  it("gray neutral has no chroma", () => {
    const n = buildScales({ ...state, neutral: "pure" }).find((s) => s.kind === "neutral")!;
    for (const s of n.steps) expect(s.oklch.c).toBeLessThan(0.01);
  });
  it("tuning affects output", () => {
    const a = buildScales(state)[0]!.steps.map((s) => s.hex);
    const b = buildScales({ ...state, tuning: { ...state.tuning, chroma: 50 } })[0]!.steps.map((s) => s.hex);
    expect(a).not.toEqual(b);
  });
});

describe("exports", () => {
  const one = scales.slice(0, 1);
  it("tailwind v4 snapshot", () => {
    expect(exportScales(one, { format: "tailwind-v4", syntax: "oklch" })).toMatchSnapshot();
  });
  it("tailwind v3 variants", () => {
    for (const v3Module of ["cjs", "esm", "ts"] as const)
      expect(exportScales(one, { format: "tailwind-v3", syntax: "hex", v3Module })).toMatchSnapshot(v3Module);
  });
  it.each(["css", "scss", "json", "dtcg", "tokens-studio"] as ExportFormat[])("%s snapshot", (format) => {
    expect(exportScales(one, { format, syntax: "hex" })).toMatchSnapshot();
  });
  it("v4 output parses back to the scale within 1 unit", () => {
    const css = exportScales(one, { format: "tailwind-v4", syntax: "oklch" });
    const to8 = converter("rgb");
    for (const step of one[0]!.steps) {
      const m = new RegExp(`--color-brand-${step.stop}: ([^;]+);`).exec(css)!;
      const rgb = to8(parse(m[1]!)!)!;
      const hex = [rgb.r, rgb.g, rgb.b].map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255));
      const want = [1, 3, 5].map((i) => parseInt(step.hex.slice(i, i + 2), 16));
      hex.forEach((v, i) => expect(Math.abs(v - want[i]!)).toBeLessThanOrEqual(2));
    }
  });
  it("dtcg and json are valid JSON", () => {
    for (const f of ["json", "dtcg", "tokens-studio"] as const) JSON.parse(exportScales(scales, { format: f, syntax: "hex" }));
  });
  it("includes the share url in the header when given", () => {
    expect(exportScales(one, { format: "css", syntax: "hex", sourceUrl: "https://x.test/?v=1" })).toContain("https://x.test/?v=1");
  });
  it("v4 can reset default colors", () => {
    expect(exportScales(one, { format: "tailwind-v4", syntax: "hex", resetDefaults: true })).toContain("--color-*: initial;");
  });
});

describe("state codec", () => {
  it("default state encodes to ?v=1 only", () => {
    expect(encodeState(DEFAULT_STATE)).toBe("v=1");
  });
  it("round-trips", () => {
    const s: PaletteState = {
      ...DEFAULT_STATE,
      base: "#f59e0b",
      name: "sun",
      neutral: "pure",
      status: false,
      format: "tailwind-v3",
      syntax: "hex",
      theme: "dark",
      tuning: { hue: -10, chroma: 120, top: 960, bottom: 300 },
    };
    expect(decodeState(encodeState(s))).toEqual(s);
  });
  it("tolerates garbage", () => {
    const s = decodeState("b=zzz&f=nope&c=bad&n=x&nm=%3Cscript%3E&o=h999,c-5,t5,bx,,&t=q");
    expect(s.base).toBe(DEFAULT_STATE.base);
    expect(s.format).toBe(DEFAULT_STATE.format);
    expect(s.name).toBe("brand");
    expect(s.tuning.hue).toBe(60);
    expect(s.tuning.chroma).toBe(0);
    expect(s.tuning.top).toBe(900);
  });
  it("accepts search-param records and short hex", () => {
    expect(decodeState({ b: "f00" }).base).toBe("#ff0000");
  });
  it("default URL is short", () => {
    expect(encodeState({ ...DEFAULT_STATE, base: "#123456", tuning: { hue: 5, chroma: 90, top: 970, bottom: 250 } }).length).toBeLessThan(80);
  });
});
