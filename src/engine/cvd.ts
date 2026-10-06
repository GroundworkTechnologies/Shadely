import { hexToRgb8, linearSrgbToOklab, linearToRgb8, rgb8ToHex, rgb8ToLinear } from "./color-space";

export type VisionMode = "normal" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";

export const VISION_LABELS: Record<VisionMode, string> = {
  normal: "Normal vision",
  protanopia: "Protanopia (no red)",
  deuteranopia: "Deuteranopia (no green)",
  tritanopia: "Tritanopia (no blue)",
  achromatopsia: "Achromatopsia (no color)",
};

type Matrix = readonly [readonly [number, number, number], readonly [number, number, number], readonly [number, number, number]];

/** Machado, Oliveira and Fernandes (2009), severity 1.0, applied to linear sRGB. */
const MATRICES: Record<Exclude<VisionMode, "normal">, Matrix> = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
  // Luminance only (Rec. 709 weights): every channel gets Y.
  achromatopsia: [
    [0.2126, 0.7152, 0.0722],
    [0.2126, 0.7152, 0.0722],
    [0.2126, 0.7152, 0.0722],
  ],
};

export const VISION_MODES = Object.keys(VISION_LABELS) as VisionMode[];

/** The 3×3 matrix for a mode (identity for normal vision). */
export function visionMatrix(mode: VisionMode): Matrix {
  return mode === "normal"
    ? [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ]
    : MATRICES[mode];
}

/** How a hex color appears under a color-vision deficiency. */
export function simulateVision(hex: string, mode: VisionMode): string {
  if (mode === "normal") return hex;
  const rgb = hexToRgb8(hex);
  if (!rgb) return hex;
  const lin = rgb8ToLinear(rgb);
  const m = MATRICES[mode];
  const out = m.map((row) => row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2]) as [number, number, number];
  return rgb8ToHex(linearToRgb8(out));
}

/** Values for an SVG <feColorMatrix type="matrix"> (use with color-interpolation-filters="linearRGB"). */
export function visionFilterValues(mode: VisionMode): string {
  const m = visionMatrix(mode);
  return [...m[0], 0, 0, ...m[1], 0, 0, ...m[2], 0, 0, 0, 0, 0, 1, 0].join(" ");
}

/** Perceptual distance (Euclidean in OKLab). About 0.02 is just noticeable. */
export function deltaE(a: string, b: string): number {
  const ra = hexToRgb8(a);
  const rb = hexToRgb8(b);
  if (!ra || !rb) return 0;
  const la = linearSrgbToOklab(rgb8ToLinear(ra));
  const lb = linearSrgbToOklab(rgb8ToLinear(rb));
  return Math.hypot(la[0] - lb[0], la[1] - lb[1], la[2] - lb[2]);
}

export interface VisionPair {
  a: string;
  b: string;
  /** Distance under the simulated vision. */
  distance: number;
  /** Distance for normal vision, for comparison. */
  normal: number;
  level: "ok" | "close" | "confusable";
}

/** Distances between every pair of named colors as seen with the given deficiency. */
export function visionPairs(colors: readonly { name: string; hex: string }[], mode: VisionMode): VisionPair[] {
  const out: VisionPair[] = [];
  for (let i = 0; i < colors.length; i++)
    for (let j = i + 1; j < colors.length; j++) {
      const A = colors[i]!;
      const B = colors[j]!;
      const distance = deltaE(simulateVision(A.hex, mode), simulateVision(B.hex, mode));
      out.push({ a: A.name, b: B.name, distance, normal: deltaE(A.hex, B.hex), level: distance < 0.05 ? "confusable" : distance < 0.1 ? "close" : "ok" });
    }
  return out.sort((x, y) => x.distance - y.distance);
}
