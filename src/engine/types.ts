/** OKLCH color: l 0..1, c >= 0 (≈0..0.4), h degrees 0..360. */
export interface Oklch {
  l: number;
  c: number;
  h: number;
}

/** Linear-light RGB triplet, 0..1 inside the gamut of its space. */
export type Rgb = readonly [number, number, number];

export const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type Stop = (typeof STOPS)[number];

export type GamutSpace = "srgb" | "p3";
