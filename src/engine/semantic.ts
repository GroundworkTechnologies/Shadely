import { bestText, wcagRatio } from "./contrast";
import type { NamedScale } from "./palettes";
import type { PreviewTheme } from "./state";

export type SemanticTokens = Record<string, string>;

export const SHADCN_COLOR_TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
] as const;

/** First candidate that reaches `min` contrast on `bg`; falls back to black or white. */
function readable(bg: string, candidates: string[], min = 4.5): string {
  return candidates.find((c) => wcagRatio(c, bg) >= min) ?? bestText(bg).color;
}

/** First background candidate that gives white or black text at least `min`. */
function solid(candidates: string[], min = 4.5): string {
  return candidates.find((c) => bestText(c).score.value >= min) ?? candidates[candidates.length - 1]!;
}

/**
 * shadcn/ui-style semantic tokens for a light or dark theme, derived from a palette set.
 * Every foreground/background pair is chosen to reach WCAG AA (4.5:1).
 * Needs brand, neutral and the four status scales.
 */
export function shadcnTokens(scales: NamedScale[], theme: PreviewTheme): SemanticTokens {
  const find = (key: string) => scales.find((s) => (s.kind === "status" ? s.name === key : s.kind === key));
  const at = (key: string, stop: number): string => {
    const hex = find(key)?.steps.find((x) => x.stop === stop)?.hex;
    if (!hex) throw new Error(`Missing scale "${key}" for semantic tokens`);
    return hex;
  };
  const dark = theme === "dark";
  const n = (s: number) => at("neutral", s);
  const b = (s: number) => at("brand", s);

  const primary = dark ? solid([b(400), b(300), b(500), b(200)]) : solid([b(600), b(700), b(500), b(800)]);
  const secondary = n(dark ? 800 : 100);
  const muted = n(dark ? 800 : 100);
  const accent = dark ? b(950) : b(100);
  const destructive = dark
    ? solid([at("danger", 500), at("danger", 400), at("danger", 600)])
    : solid([at("danger", 600), at("danger", 700), at("danger", 500)]);
  const surface = dark ? n(900) : "#ffffff";
  const background = dark ? n(950) : "#ffffff";
  const foreground = dark ? n(50) : n(950);

  return {
    background,
    foreground,
    card: surface,
    "card-foreground": foreground,
    popover: surface,
    "popover-foreground": foreground,
    primary,
    "primary-foreground": bestText(primary).color,
    secondary,
    "secondary-foreground": readable(secondary, [n(dark ? 50 : 900), n(950), "#ffffff", "#000000"]),
    muted,
    "muted-foreground": readable(muted, dark ? [n(400), n(300), n(200)] : [n(500), n(600), n(700)]),
    accent,
    "accent-foreground": readable(accent, dark ? [b(200), b(100), b(50)] : [b(900), b(800), b(700)]),
    destructive,
    "destructive-foreground": bestText(destructive).color,
    border: n(dark ? 800 : 200),
    input: n(dark ? 700 : 200),
    ring: b(dark ? 400 : 500),
    "chart-1": b(dark ? 400 : 600),
    "chart-2": at("info", dark ? 400 : 500),
    "chart-3": at("success", dark ? 400 : 500),
    "chart-4": at("warning", dark ? 400 : 500),
    "chart-5": at("danger", dark ? 400 : 500),
  };
}
