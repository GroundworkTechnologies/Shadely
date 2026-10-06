import { parseColor } from "./parse";
import { oklchToHex } from "./color-space";
import type { ColorSyntax } from "./format";
import type { ExportFormat } from "./export";

export type NeutralMode = "tinted" | "gray" | "off";
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
};
const FORMAT_KEYS = Object.fromEntries(Object.entries(FORMATS).map(([k, v]) => [v, k])) as Record<ExportFormat, string>;
const SYNTAXES: ColorSyntax[] = ["oklch", "hex", "hsl", "rgb", "p3"];
const NEUTRALS: Record<string, NeutralMode> = { t: "tinted", g: "gray", o: "off" };

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

/** Serialise state compactly. Defaults are omitted, so the default URL is `?v=1`. */
export function encodeState(s: PaletteState): string {
  const p = new URLSearchParams();
  p.set("v", "1");
  const d = DEFAULT_STATE;
  if (s.base !== d.base) p.set("b", s.base.slice(1));
  if (s.name !== d.name) p.set("nm", s.name);
  if (s.neutral !== d.neutral) p.set("n", s.neutral[0]!);
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
    status: get("s") === undefined ? d.status : get("s") !== "0",
    format: format ?? d.format,
    syntax: syntax ?? d.syntax,
    theme: get("t") === "d" ? "dark" : "light",
    tuning,
  };
}
