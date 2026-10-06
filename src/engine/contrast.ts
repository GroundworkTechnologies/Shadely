import { hexToRgb8, srgbToLinear } from "./color-space";

function rgb(hex: string): [number, number, number] {
  return hexToRgb8(hex) ?? [0, 0, 0];
}

/** WCAG 2.x relative luminance. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => srgbToLinear(v / 255)) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, 1..21, unrounded. */
export function wcagRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export type WcagLevel = "AAA" | "AA" | "AA Large" | "Fail";

export function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
}

/** Display a ratio rounded down to 2 dp so 4.499 never reads as 4.5. */
export function formatRatio(ratio: number): string {
  return (Math.floor(ratio * 100 + 1e-9) / 100).toFixed(2);
}

// APCA 0.0.98G-4g (draft WCAG 3). Implemented from the published formula.
function apcaY(hex: string): number {
  const [r, g, b] = rgb(hex);
  return (
    0.2126729 * (r / 255) ** 2.4 + 0.7151522 * (g / 255) ** 2.4 + 0.072175 * (b / 255) ** 2.4
  );
}

/** Signed APCA lightness contrast. Positive = dark text on light bg. */
export function apcaLc(text: string, background: string): number {
  const soft = (y: number) => (y >= 0.022 ? y : y + (0.022 - y) ** 1.414);
  const yt = soft(apcaY(text));
  const yb = soft(apcaY(background));
  if (Math.abs(yb - yt) < 0.0005) return 0;
  if (yb > yt) {
    const s = (yb ** 0.56 - yt ** 0.57) * 1.14;
    return s < 0.1 ? 0 : (s - 0.027) * 100;
  }
  const s = (yb ** 0.65 - yt ** 0.62) * 1.14;
  return s > -0.1 ? 0 : (s + 0.027) * 100;
}

export type ApcaTier = "Body" | "Content" | "Large" | "Non-text" | "Fail";

/** Rough APCA use tiers: 75 body text, 60 content, 45 large/headline, 30 non-text. */
export function apcaTier(lc: number): ApcaTier {
  const a = Math.abs(lc);
  if (a >= 75) return "Body";
  if (a >= 60) return "Content";
  if (a >= 45) return "Large";
  if (a >= 30) return "Non-text";
  return "Fail";
}

export type ContrastMetric = "wcag" | "apca";

export interface PairScore {
  /** WCAG ratio, or absolute APCA Lc. */
  value: number;
  pass: boolean;
  label: string;
}

/** Score text on a background. `pass` means usable for normal-size body text. */
export function scorePair(text: string, background: string, metric: ContrastMetric): PairScore {
  if (metric === "wcag") {
    const r = wcagRatio(text, background);
    return { value: r, pass: r >= 4.5, label: wcagLevel(r) };
  }
  const lc = Math.abs(apcaLc(text, background));
  return { value: lc, pass: lc >= 75, label: apcaTier(lc) };
}

/** Matrix [background][foreground] of scores for a list of colors. */
export function contrastMatrix(hexes: readonly string[], metric: ContrastMetric): PairScore[][] {
  return hexes.map((bg) => hexes.map((fg) => scorePair(fg, bg, metric)));
}

/** Whichever of white or black text reads better on this background. */
export function bestText(background: string, metric: ContrastMetric = "wcag"): { color: "#ffffff" | "#000000"; score: PairScore } {
  const w = scorePair("#ffffff", background, metric);
  const k = scorePair("#000000", background, metric);
  return w.value >= k.value ? { color: "#ffffff", score: w } : { color: "#000000", score: k };
}

/** First stop (in the given order) that reaches the threshold against a color. */
export function minimumStop<T extends { hex: string; stop: number }>(
  steps: readonly T[],
  against: string,
  metric: ContrastMetric,
  threshold: number,
): T | null {
  for (const s of steps) {
    const { value } = scorePair(s.hex, against, metric);
    if (value >= threshold) return s;
  }
  return null;
}
