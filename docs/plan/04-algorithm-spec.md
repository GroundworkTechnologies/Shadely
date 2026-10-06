# Phase 2 — Plan (part 4): color generation algorithm spec

Public API (engine):

```ts
type Oklch = { l: number; c: number; h: number };      // l 0..1, c ≥ 0, h 0..360
type Stop = 50|100|200|300|400|500|600|700|800|900|950;

interface ScaleOptions {
  anchor?: 'auto' | Stop;       // default 'auto' (nearest stop by L)
  lightnessRange?: [number, number]; // L for stop 50 and 950, default [0.975, 0.27]
  chromaScale?: number;         // multiplier on all stops except the anchor, default 1
  hueShift?: number;            // degrees lighter→darker (+warm lights / cool darks), default 0
  gamut?: 'srgb' | 'p3';        // default 'srgb'
}
interface ScaleStep { stop: Stop; oklch: Oklch; hex: string; clipped: boolean; isAnchor: boolean }
generateScale(base: string | Oklch, opts?: ScaleOptions): ScaleStep[]   // 11 items, ascending stops
```

## 1. Conversions (color-space.ts)
sRGB 8-bit ⇄ linear (IEC 61966-2-1) ⇄ Oklab (Ottosson's published M1/M2 matrices) ⇄ OKLCH (`c=hypot(a,b)`, `h=atan2(b,a)` in degrees, normalized to [0,360)). Hue is *powerless* when `c < 1e-4`: treat as 0 for output, but preserve the input hue when the user supplied one (neutral tint). P3: linear Display-P3 matrices via XYZ D65.

## 2. Reference curves (curves.ts) — derived from Tailwind v4

Lightness targets `L_ref[stop]`:
`50: .970, 100: .935, 200: .885, 300: .815, 400: .715, 500: .625, 600: .550, 700: .490, 800: .425, 900: .380, 950: .285` (mean of chromatic Tailwind families, rounded; to be refit from the `tailwindcss` package in the first build task and frozen as data).

Chroma profile `K[stop]` (fraction of the family's peak chroma):
`50: .06, 100: .13, 200: .24, 300: .43, 400: .68, 500: .88, 600: 1.0, 700: .98, 800: .82, 900: .62, 950: .40`.

## 3. Algorithm

Input base hex → `(L0, C0, H0)`.

1. **Anchor selection.** If `anchor='auto'`: pick stop `a` minimizing `|L_ref[a] − L0|`; ties → the stop closer to 500. If `L0 > L_ref[50] + 0.02` or `< L_ref[950] − 0.02`, clamp to 50 / 950 and mark `extreme` (anchor still pinned exactly; ends re-spaced).
2. **Lightness mapping.** Build control points `(stop_index → L)`: endpoints `L(50)=lightnessRange[0]`, `L(950)=lightnessRange[1]`, anchor `L(a)=L0`. Other stops are placed by monotone piecewise-linear interpolation of the *normalized* reference curve between consecutive control points, i.e. for stops between control points P and Q: `L = L_P + (L_Q − L_P) · (Lref − Lref_P)/(Lref_Q − Lref_P)`. Guarantees: strictly decreasing, anchor exact, shape follows Tailwind.
3. **Chroma.** `C_i = C0 · chromaScale · K[i] / K[a]` for non-anchor stops; anchor keeps `C0` exactly. Cap `C_i ≤ Cmax(L_i, H_i)` (see gamut) *only by reduction*, never boosting beyond requested. **Near-neutral rule:** if `C0 < 0.02`, `C_i = C0 · chromaScale · (K[i]/K[a])` with `K` flattened toward 1 (`K' = 0.5 + 0.5K`) so grays don't develop unwanted tint at the ends.
4. **Hue.** `H_i = H0 + hueShift · (i_norm)` where `i_norm` runs from −1 (stop 50) to +1 (stop 950), zero at the anchor's position (`(index − idx(a)) / 5` clamped to [−1,1]). Default `hueShift = 0` (user's hue is respected). Optional "natural" preset uses ±6° with sign chosen toward 60° (yellow) for lights and toward 265° (blue) for darks (Bezold–Brücke compensation).
5. **Gamut mapping** (per stop, target space T): if `(L_i, C_i, H_i)` is inside T within ε = 1e-4 keep. Else binary-search the largest `c ∈ [0, C_i]` at constant `L_i, H_i` that is inside T (24 iterations); then apply the CSS-Color-4 "just-noticeable" check: if the chroma-reduced color and a channel-clipped color are within ΔE_OK < 0.02, use the clipped one. Set `clipped = true` if `c < C_i − 0.002`.
6. **Quantize.** Hex = round(channels·255) from the mapped linear sRGB. After rounding, recompute `oklch` from the *hex* so UI numbers equal exported numbers (except in P3 mode, where OKLCH string holds the float values and hex is the sRGB fallback).
7. **Post-checks (dev/test only, not at runtime):** monotone L; anchor hex equals input hex (when input is in sRGB); no NaN.

## 4. Derived palettes
- **Neutral (tinted):** `generateScale({l:.62, c: min(C0·0.08, 0.025), h: H0})`, anchored `'auto'`, chromaScale 1, lightnessRange `[0.985, 0.14]` → extends further than chromatic ranges for text/dark surfaces. "Gray" mode uses `c = 0`.
- **Status:** fixed hues (success 150, warning 80, danger 25, info 245) with base L .62 and chroma `clamp(C0, 0.12, 0.2)` so they feel in-family; each passes the same pipeline. Users may override hues.
- **Harmony (v2):** hue offsets 30/180/150-210/120-240/90-180-270 with chroma/lightness inherited.

## 5. Contrast algorithms (contrast.ts)
- **WCAG 2.2:** `lin = c ≤ .04045 ? c/12.92 : ((c+.055)/1.055)^2.4`; `Y = .2126R + .7152G + .0722B`; `ratio = (Ymax+.05)/(Ymin+.05)`. Do not round before comparing thresholds (4.5 means 4.5, not 4.495). Display rounded to 2 dp *down*.
- **APCA (0.0.98G-4g constants):** `Ys` soft-clamp black at 0.022 with exponent 1.414; normal polarity (dark text on light bg) `Lc = (Ybg^0.56 − Ytxt^0.57)·1.14·100`; reverse polarity `(Ybg^0.65 − Ytxt^0.62)·1.14·100` (negative); values with `|Lc| < 10` → 0 (offset 0.027). Output signed Lc; badge tiers at 90/75/60/45/30.
- **Matrix:** `matrix(scale, metric) → cells[bg][fg]` 11×11 (+ white/black rows).
- **Hints:** `minimumStopFor(scale, againstHex, threshold)`.

## 6. Test cases (Vitest; oracles via `culori` and `apca-w3` as devDependencies)

**Conversions (exact within tolerance 1e-3 L/C, 0.5° H):**
| Input | Expected OKLCH |
|---|---|
| `#ffffff` | (1, 0, —) |
| `#000000` | (0, 0, —) |
| `#ff0000` | (0.628, 0.258, 29.23) |
| `#00ff00` | (0.866, 0.295, 142.5) |
| `#0000ff` | (0.452, 0.313, 264.05) |
| `#3b82f6` | matches Tailwind blue-500 v3 hex → compare against culori |
Round trip `hex → oklch → hex` is identity for a stratified 4,096-sample grid + 1,000 seeded random colors.

**Contrast:**
| Pair | WCAG | APCA |
|---|---|---|
| `#000` on `#fff` | 21.00 | ≈ 106 (black on white), ≈ −108 (white on black) — verify against `apca-w3` |
| `#767676` on `#fff` | 4.54 (passes AA) | — |
| `#777777` on `#fff` | 4.48 (fails AA; ensures no rounding-up) | — |
| `#fff` on `#fff` | 1.00 | 0 |

**Scale properties (property-based over seeded 2,000 random bases + fixed edge set: `#000`, `#fff`, `#808080`, `#ff0000`, `#00ff00`, `#0000ff`, `#ffff00`, `#facc15`, `#1e3a8a`, `#f5f5f4`, `#010203`):**
1. 11 steps, stops ascending, hex valid `^#[0-9a-f]{6}$`, unique unless base is achromatic extreme.
2. L strictly decreasing by stop (after quantization, non-increasing with ≥ 0.01 gap except near white/black).
3. Anchor stop equals the input hex exactly (sRGB inputs).
4. All hexes in sRGB gamut (by construction) and `clipped` is true only when requested chroma exceeded gamut.
5. |H_i − H0| ≤ 3° for C_i > 0.03 when `hueShift = 0` (gamut reduction at constant H, quantization noise only).
6. Chroma profile: stop 50 chroma ≤ 0.10·C0-peak; peak within stops 500–700 for chromatic bases.
7. Determinism: same input → identical output; JSON-snapshot of 12 reference palettes (blue, amber, emerald, rose, violet, yellow, slate-ish, near-white, near-black, pure gray, saturated cyan, P3 mode).
8. Typical-use guarantee: for bases with `0.45 < L0 < 0.75` and `C0 > 0.08`: stop 50 as bg with stop 900 text ≥ 7:1; white on 600 ≥ 4.5:1 *or* flagged in metadata as "lighten 600" (decision: tune curve until ≥ 95% of the seeded set passes; report failures rather than silently shifting).
9. Idempotence: `generateScale(scale[anchor].hex)` returns the same scale.
10. Export snapshot tests per format (v4 `@theme`, v3 CJS/ESM/TS, CSS, SCSS, JSON, DTCG, Tokens Studio) and parse-back tests (CSS output parsed by `culori` equals scale within 1 unit).

**State codec:** encode→decode identity; unknown params ignored; v0/legacy migrate; malformed hex falls back to default; URL length < 400 chars for default state.

## 7. Known limitations to document
Base colors extremely light/dark compress the scale on one side; very high-chroma yellows cannot have both high lightness and high chroma; P3 values show wider differences on P3 displays only; hex output of a P3 palette is a mapped fallback.

## 8. Implementation notes (deviations from the spec above, made during the build)

- **Chroma model.** The fixed `K` profile in §2–3 produced beige light shades for hues like amber, because available chroma depends strongly on hue. Replaced with `GAMUT_FRACTION` in `src/engine/curves.ts`: each stop's chroma is `share × fraction[stop] × maxChroma(L, H)`, where `share` is how much of the gamut the base color uses at its own stop. Pale stops 50/100 have a small absolute chroma floor so tints never read as gray.
- **Gamut mapping JND** is 0.004, not 0.02. At 0.02, random bases drifted up to 12° in hue; at 0.004 the maximum observed drift is under 4° (tested ≤ 5°).
- **Hue shift** is linear degrees per half-scale from the anchor; the "natural" Bezold–Brücke preset is not implemented yet.
- **P3 mode** keeps the base color's wide-gamut chroma; it does not boost chroma by itself. `hex` is always the sRGB fallback.
- **Reference curve** `L_REF` is hand-fitted to Tailwind v4; refitting from the package is still a TODO.
