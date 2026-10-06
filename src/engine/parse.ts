import { hexToOklch, linearSrgbToOklch, rgb8ToLinear } from "./color-space";
import type { Oklch } from "./types";

const num = String.raw`[-+]?(?:\d+\.?\d*|\.\d+)`;

function hslToRgb8(h: number, s: number, l: number): [number, number, number] {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

/** Parse hex, rgb(), hsl() or oklch(). Returns null if unrecognised. */
export function parseColor(input: string): Oklch | null {
  const s = input.trim().toLowerCase();
  if (!s) return null;
  if (/^#?[0-9a-f]{3}$|^#?[0-9a-f]{6}$/.test(s)) return hexToOklch(s);

  let m = new RegExp(`^rgba?\\(\\s*(${num})[ ,]+(${num})[ ,]+(${num})\\s*(?:[,/]\\s*${num}%?\\s*)?\\)$`).exec(s);
  if (m) {
    const [r, g, b] = [m[1], m[2], m[3]].map((v) => Math.max(0, Math.min(255, Math.round(parseFloat(v!)))));
    return linearSrgbToOklch(rgb8ToLinear([r!, g!, b!]));
  }

  m = new RegExp(`^hsla?\\(\\s*(${num})(?:deg)?[ ,]+(${num})%[ ,]+(${num})%\\s*(?:[,/]\\s*${num}%?\\s*)?\\)$`).exec(s);
  if (m) {
    const h = ((parseFloat(m[1]!) % 360) + 360) % 360;
    const sat = Math.max(0, Math.min(100, parseFloat(m[2]!))) / 100;
    const lig = Math.max(0, Math.min(100, parseFloat(m[3]!))) / 100;
    return linearSrgbToOklch(rgb8ToLinear(hslToRgb8(h, sat, lig)));
  }

  m = new RegExp(`^oklch\\(\\s*(${num})(%?)[ ,]+(${num})(%?)[ ,]+(${num})(?:deg)?\\s*(?:/\\s*${num}%?\\s*)?\\)$`).exec(s);
  if (m) {
    let l = parseFloat(m[1]!);
    if (m[2] === "%") l /= 100;
    let c = parseFloat(m[3]!);
    if (m[4] === "%") c = (c / 100) * 0.4;
    const h = ((parseFloat(m[5]!) % 360) + 360) % 360;
    if (l < 0 || l > 1 || c < 0) return null;
    return { l, c, h };
  }
  return null;
}
