import { bestText, buildScales, type NamedScale, type PaletteState, type PreviewTheme } from "@/engine";

type Vars = Record<string, string>;

const LETTER: Record<string, string> = { brand: "b", neutral: "n", success: "s", warning: "w", danger: "d", info: "i", secondary: "a", accent: "c", tertiary: "t" };

/** Preview always has every scale, even when the user turned some off for export. */
export function previewScales(state: PaletteState): NamedScale[] {
  return buildScales({ ...state, neutral: state.neutral === "off" ? "tinted" : state.neutral, status: true });
}

/** CSS custom properties that theme the preview subtree, for the chosen light/dark theme. */
export function previewVars(scales: NamedScale[], theme: PreviewTheme): Vars {
  const vars: Vars = {};
  const pick = (kind: string, stop: number) => scales.find((s) => (s.kind === "status" ? s.name : s.kind) === kind)?.steps.find((x) => x.stop === stop)?.hex ?? "#808080";
  for (const s of scales) {
    const letter = LETTER[s.kind === "status" || s.kind === "accent" ? s.name : s.kind];
    if (letter) for (const x of s.steps) vars[`--${letter}-${x.stop}`] = x.hex;
  }
  const dark = theme === "dark";

  // Pick the lightest brand stop (>=500) that gives the primary button readable text.
  const candidates = dark ? [400, 300, 500] : [600, 500, 700, 800];
  const primaryStop = candidates.find((st) => bestText(pick("brand", st)).score.pass) ?? (dark ? 400 : 700);
  const primary = pick("brand", primaryStop);
  const primaryHover = pick("brand", dark ? primaryStop - 100 : primaryStop + 100);

  Object.assign(vars, {
    "--p-bg": pick("neutral", dark ? 950 : 50),
    "--p-surface": dark ? pick("neutral", 900) : "#ffffff",
    "--p-surface-2": pick("neutral", dark ? 800 : 100),
    "--p-border": pick("neutral", dark ? 800 : 200),
    "--p-border-strong": pick("neutral", dark ? 700 : 300),
    "--p-fg": pick("neutral", dark ? 50 : 900),
    "--p-muted": pick("neutral", dark ? 400 : 600),
    "--p-primary": primary,
    "--p-primary-hover": primaryHover,
    "--p-primary-fg": bestText(primary).color,
    "--p-soft": pick("brand", dark ? 950 : 50),
    "--p-soft-fg": pick("brand", dark ? 300 : 700),
    "--p-ring": pick("brand", dark ? 400 : 500),
    "--p-tint": pick("brand", dark ? 900 : 200),
    "--p-tint-2": pick("brand", dark ? 800 : 300),
    "--p-tint-fg": pick("brand", dark ? 100 : 950),
  });
  for (const k of ["success", "warning", "danger", "info"]) {
    vars[`--p-${k}-bg`] = pick(k, dark ? 950 : 50);
    vars[`--p-${k}-fg`] = pick(k, dark ? 300 : 800);
    vars[`--p-${k}-bd`] = pick(k, dark ? 800 : 200);
    vars[`--p-${k}-solid`] = pick(k, 500);
  }
  return vars;
}
