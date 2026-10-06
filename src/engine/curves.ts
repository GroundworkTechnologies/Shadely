import type { Stop } from "./types";

/**
 * Reference lightness per stop, averaged from Tailwind v4's chromatic families.
 * Frozen data: see docs/plan/04-algorithm-spec.md.
 */
export const L_REF: Record<Stop, number> = {
  50: 0.97,
  100: 0.935,
  200: 0.885,
  300: 0.815,
  400: 0.715,
  500: 0.625,
  600: 0.55,
  700: 0.49,
  800: 0.425,
  900: 0.38,
  950: 0.285,
};

/**
 * Chroma as a fraction of the maximum in-gamut chroma at each stop's lightness
 * and hue. Hue-aware by construction (yellows keep vivid lights, blues stay
 * pale at 50), fitted to Tailwind v4: pale at the ends, full in the middle.
 */
export const GAMUT_FRACTION: Record<Stop, number> = {
  50: 0.8,
  100: 0.85,
  200: 0.8,
  300: 0.9,
  400: 0.95,
  500: 1,
  600: 1,
  700: 1,
  800: 0.95,
  900: 0.9,
  950: 0.85,
};
