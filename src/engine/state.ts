import { parseColor } from "./parse";
import { STOPS, type Stop } from "./types";
import { oklchToHex } from "./color-space";
import type { ColorSyntax } from "./format";
import type { ExportFormat } from "./export";

export const NEUTRAL_FAMILIES = ["slate", "gray", "zinc", "neutral", "stone", "taupe", "mauve", "mist", "olive"] as const;
export type NeutralFamily = (typeof NEUTRAL_FAMILIES)[number];
/** tinted = follows the brand hue; pure = chroma 0; or one of Tailwind's neutral families. */
export type NeutralMode = "tinted" | "pure" | "off" | NeutralFamily;
export type HarmonyMode = "off" | "analogous" | "complementary" | "split" | "triadic" | "tetradic" | "square";
export type PreviewTheme = "light" | "dark";

export interface Tuning {
  /** Degrees of hue shift toward darker stops. */
  hue: number;
  /** Chroma multiplier in percent. */
  chroma: number;
  /** Lightness of stop 50, ×1000. */
  top: number;
  /** Lightness of stop 950, ×1000. */
  bottom: number;
}

export interface PaletteState {
  v: 1;
  /** Brand base color as #rrggbb. */
  base: string;
  /** Brand palette name (kebab-case). */
  name: string;
  neutral: NeutralMode;
  /** How strongly a tinted neutral picks up the brand hue, in percent. */
  neutralTint: number;
  /** Stop the base color lands on; "auto" picks the nearest by lightness. */
  anchor: "auto" | Stop;
  /** Brand shades pinned by the user (locked or edited), as #rrggbb. */
  overrides: Partial<Record<Stop, string>>;
  /** Derives secondary / accent scales from the brand hue. */
  harmony: HarmonyMode;
  status: boolean;
  format: ExportFormat;
  syntax: ColorSyntax;
  theme: PreviewTheme;
  tuning: Tuning;
}

export const DEFAULT_TUNING: Tuning = { hue: 0, chroma: 100, top: 975, bottom: 270 };

export const DEFAULT_STATE: PaletteState = {
  v: 1,
  base: "#2f8f6b",
  name: "brand",
  neutral: "tinted",
  neutralTint: 100,
  anchor: "auto",
  overrides: {},
  harmony: "off",
  status: true,
  format: "tailwind-v4",
  syntax: "oklch",
  theme: "light",
  tuning: DEFAULT_TUNING,
};

const FORMATS: Record<string, ExportFormat> = {
  v4: "tailwind-v4",
  v3: "tailwind-v3",
  css: "css",
  scss: "scss",
  json: "json",
  dtcg: "dtcg",
  ts: "tokens-studio",
  sh: "shadcn",
  sd: "style-dictionary",
  cm: "css-modern",
  fl: "flutter",
  an: "android",
  kt: "compose",
  sw: "ios",
};
const FORMAT_KEYS = Object.fromEntries(Object.entries(FORMATS).map(([k, v]) => [v, k])) as Record<ExportFormat, string>;
const SYNTAXES: ColorSyntax[] = ["oklch", "hex", "hsl", "rgb", "p3"];
const NEUTRALS: Record<string, NeutralMode> = { t: "tinted", g: "pure", o: "off", ...Object.fromEntries(NEUTRAL_FAMILIES.map((f) => [f, f])) };
const NEUTRAL_KEYS: Record<string, string> = { tinted: "t", pure: "g", off: "o" };
const HARMONIES: Record<string, HarmonyMode> = { an: "analogous", co: "complementary", sp: "split", tr: "triadic", te: "tetradic", sq: "square" };
const HARMONY_KEYS = Object.fromEntries(Object.entries(HARMONIES).map(([k, v]) => [v, k])) as Record<string, string>;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const int = (s: string | undefined) => (s !== undefined && /^-?\d+$/.test(s) ? parseInt(s, 10) : undefined);

export function isValidName(n: string): boolean {
  return /^[a-z][a-z0-9-]{0,23}$/.test(n);
}

/** Normalise any parseable color to #rrggbb, or null. */
export function normalizeHex(input: string): string | null {
  const o = parseColor(input);
  return o ? oklchToHex(o) : null;
}

function parseOverrides(raw: string | undefined): Partial<Record<Stop, string>> {
  const out: Partial<Record<Stop, string>> = {};
  for (const part of (raw ?? "").split(",")) {
    const [stop, hex] = part.split(":");
    const n = int(stop);
    if (n === undefined || !(STOPS as readonly number[]).includes(n) || !hex || !/^[0-9a-fA-F]{6}$/.test(hex)) continue;
    out[n as Stop] = `#${hex.toLowerCase()}`;
  }
  return out;
}

/** Serialise state compactly. Defaults are omitted, so the default URL is `?v=1`. */
export function encodeState(s: PaletteState): string {
  const p = new URLSearchParams();
  p.set("v", "1");
  const d = DEFAULT_STATE;
  if (s.base !== d.base) p.set("b", s.base.slice(1));
  if (s.name !== d.name) p.set("nm", s.name);
  if (s.neutral !== d.neutral) p.set("n", NEUTRAL_KEYS[s.neutral] ?? s.neutral);
  if (s.neutralTint !== d.neutralTint) p.set("nt", String(s.neutralTint));
  if (s.anchor !== d.anchor) p.set("a", String(s.anchor));
  if (s.harmony !== "off") p.set("hm", HARMONY_KEYS[s.harmony]!);
  const locks = STOPS.filter((st) => s.overrides[st]).map((st) => `${st}:${s.overrides[st]!.slice(1)}`);
  if (locks.length) p.set("lk", locks.join(","));
  if (s.status !== d.status) p.set("s", s.status ? "1" : "0");
  if (s.format !== d.format) p.set("f", FORMAT_KEYS[s.format]);
  if (s.syntax !== d.syntax) p.set("c", s.syntax);
  if (s.theme !== d.theme) p.set("t", s.theme === "dark" ? "d" : "l");
  const t = s.tuning;
  const dt = DEFAULT_TUNING;
  const o: string[] = [];
  if (t.hue !== dt.hue) o.push(`h${t.hue}`);
  if (t.chroma !== dt.chroma) o.push(`c${t.chroma}`);
  if (t.top !== dt.top) o.push(`t${t.top}`);
  if (t.bottom !== dt.bottom) o.push(`b${t.bottom}`);
  if (o.length) p.set("o", o.join(","));
  return p.toString();
}

/** Parse untrusted params. Never throws; invalid pieces fall back to defaults. */
export function decodeState(input: string | URLSearchParams | Record<string, string | string[] | undefined>): PaletteState {
  const get = (k: string): string | undefined => {
    if (typeof input === "string") return new URLSearchParams(input).get(k) ?? undefined;
    if (input instanceof URLSearchParams) return input.get(k) ?? undefined;
    const v = input[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const d = DEFAULT_STATE;
  const base = get("b") ? normalizeHex(get("b")!) : null;
  const name = get("nm");
  const format = FORMATS[get("f") ?? ""];
  const syntax = SYNTAXES.find((x) => x === get("c"));
  const tuning = { ...DEFAULT_TUNING };
  for (const part of (get("o") ?? "").split(",")) {
    const n = int(part.slice(1));
    if (n === undefined) continue;
    if (part[0] === "h") tuning.hue = clamp(n, -60, 60);
    else if (part[0] === "c") tuning.chroma = clamp(n, 0, 200);
    else if (part[0] === "t") tuning.top = clamp(n, 900, 1000);
    else if (part[0] === "b") tuning.bottom = clamp(n, 0, 450);
  }
  return {
    v: 1,
    base: base ?? d.base,
    name: name && isValidName(name) ? name : d.name,
    neutral: NEUTRALS[get("n") ?? ""] ?? d.neutral,
    neutralTint: get("nt") !== undefined && int(get("nt")) !== undefined ? clamp(int(get("nt"))!, 0, 200) : d.neutralTint,
    anchor: (STOPS as readonly number[]).includes(int(get("a")) ?? -1) ? (int(get("a")) as Stop) : d.anchor,
    overrides: parseOverrides(get("lk")),
    harmony: HARMONIES[get("hm") ?? ""] ?? d.harmony,
    status: get("s") === undefined ? d.status : get("s") !== "0",
    format: format ?? d.format,
    syntax: syntax ?? d.syntax,
    theme: get("t") === "d" ? "dark" : "light",
    tuning,
  };
}
