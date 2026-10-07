# 02 — Color science

## 1. Which space to build scales in

| | HSL | CIELAB / LCH | OKLab / **OKLCH** |
|---|---|---|---|
| Perceptual lightness | Poor: `hsl(60 100% 50%)` yellow looks far brighter than `hsl(240 100% 50%)` blue at identical L | Good, but known blue→purple hue shift when chroma changes | Good; hue is linear-ish, blues stay blue |
| Chroma control | "Saturation" is relative to gamut, not perceptual | Yes | Yes (absolute chroma) |
| Gamut mapping | Always in sRGB (never out of range, but unevenly vivid) | Needs mapping | Needs mapping; CSS Color 4 specifies OKLCH-based mapping |
| Native CSS | `hsl()` | `lch()`, `lab()` | `oklch()`, `oklab()` (baseline widely available since 2023) |
| Tailwind v4 | no | no | **yes — default palette is OKLCH** |

**Recommendation: OKLCH** for generation, interpolation and gamut mapping. Reasons: (1) equal L steps look equal across hues, which is the whole point of a 50–950 scale; (2) matches Tailwind v4 output exactly, so exported values are lossless; (3) absolute chroma lets us keep neutrals and brights consistent; (4) CSS Color 4 gamut-mapping algorithm is defined in it. Keep HSL only as an *input/output convenience*, never as the working space. Use Oklab (Ottosson 2020, the revised matrices) for conversions; derive OKLCH from it.

## 2. How Tailwind's palettes are structured (v4, OKLCH)

Measured from the default theme values (blue / gray as examples; `L%` `C` `H`):

| Stop | blue L | blue C | gray L | gray C |
|---|---|---|---|---|
| 50 | 97.0 | 0.014 | 98.5 | 0.002 |
| 100 | 93.2 | 0.032 | 96.7 | 0.003 |
| 200 | 88.2 | 0.059 | 92.8 | 0.006 |
| 300 | 80.9 | ~0.10 | 87.2 | 0.010 |
| 400 | 70.7 | 0.165 | 70.7 | 0.022 |
| 500 | 62.3 | 0.214 | 55.1 | 0.027 |
| 600 | 54.6 | 0.245 | 44.6 | 0.030 |
| 700 | ~48.8 | ~0.25 | 37.3 | 0.034 |
| 800 | 42.4 | 0.199 | 27.8 | 0.033 |
| 900 | 37.9 | 0.146 | 21.0 | 0.034 |
| 950 | 28.2 | 0.091 | 13.0 | 0.028 |

Takeaways:
- **Lightness curve** is nearly shared by all chromatic families: ≈ 97/93/88/81/71/62/55/49/42/38/28. Steps are larger in the light half (50→300 spans 16 L) and compress in darks. 500 ≈ L 0.62–0.65 for chromatic colors; Tailwind does *not* put every family at the same L (yellow/lime/amber sit higher: yellow-500 L≈79.5, yellow-400 ≈85) — the curve is hue-aware because available chroma differs by hue.
- **Chroma** is a bell: ~6% of peak at 50, peaking at 600–700, falling to ~40% at 950. Peak is bounded by sRGB gamut at that L/H.
- **Hue** is nearly constant per family (e.g. blue 254→268 across the scale: slightly more purple in darks). Small drift is intentional.
- Neutrals (gray/zinc/slate/stone/…) use very low chroma with a tinted hue; v4.2 added taupe, mauve, mist, olive.

## 3. Contrast: WCAG 2.2 and APCA

**WCAG 2.x** ratio = (L1+0.05)/(L2+0.05) using sRGB relative luminance. Thresholds: normal text 4.5 (AA) / 7 (AAA); large text (≥24px or ≥18.66px bold) 3 / 4.5; non-text UI (borders, icons, focus rings) 3. WCAG 2.2 did not change contrast math. Known flaw: over-rewards dark-on-dark and mis-rates mid colors.

**APCA** (WCAG 3 draft, Lc ‑108…+106, polarity-aware, font-size/weight dependent). Rough guidance: Lc 90 preferred body text; Lc 75 min body text (≥16px regular); Lc 60 large/semi-bold content text; Lc 45 large headlines; Lc 30 absolute minimum for non-text; Lc 15 invisible-ish. Rough equivalents: Lc 60 ≈ 3:1, 75 ≈ 4.5:1, 90 ≈ 7:1 — "functionally similar, not backward compatible". APCA is a **draft**, not legally recognized; WCAG 2.2 AA remains the compliance baseline.

**How Shadely should show it** (each scale):
1. **Per-shade chip**: best of white/black text, ratio, badge `AA`/`AAA`/`AA Large`/`Fail`, and APCA Lc — toggle metric (WCAG | APCA | both).
2. **Pairing matrix** 11×11: row = background, col = foreground; cell colored by pass level; hover for numbers. This is what designers actually need ("what text color on 100/700?").
3. **Guided picks**: automatically list "Safe text on 50/100", "Min shade for AA text on white", "Min for 3:1 UI on white".
4. Never rely on color alone: pass/fail uses text + icon + shape, not red/green only.

Implementation note: APCA constants are public (SAPC-8 / 0.0.98G-4g). Re-implement from the published formula and cross-check with the `apca-w3` package in dev tests only (license check — see Risks).

## 4. Gamut handling

- sRGB is the baseline for hex/rgb/hsl. Many OKLCH values are outside sRGB, especially high-chroma blues/greens/yellows at the ends of the scale.
- **Don't clip channels** (RGB clamp changes hue and L). Use **chroma reduction at constant L and H** (binary search to the gamut edge). The CSS Color 4 mapping adds a ΔE_OK < 0.02 "just noticeable" shortcut to avoid over-darkening; adopt that.
- **Display-P3**: offer an opt-in "P3 boost": allow chroma up to the P3 boundary, emit `color(display-p3 r g b)` or OKLCH with an `@media (color-gamut: p3)` override, and always keep an sRGB fallback in the same output. Gamut test = linear channel values in [−ε, 1+ε] for the target space.
- UI must show a per-swatch badge "clipped" when chroma was reduced vs. requested, so users are not surprised.
- Hex/HSL exports are always sRGB-mapped; OKLCH export keeps the mapped sRGB values by default (so Tailwind v3 and v4 users see the same colors) unless P3 mode is on.

## 5. Decisions

1. Generation, interpolation, mapping: **OKLCH** (Oklab matrices from Ottosson).
2. Output stored internally as OKLCH floats; formatted at export edge.
3. Lightness curve: Tailwind-derived reference curve, hue-aware ceiling via gamut, with the user's base color **anchored at the nearest stop, not forced to 500**.
4. Contrast: WCAG 2.2 default, APCA as toggle; both computed on the **sRGB-mapped** hex actually exported.
5. P3 is opt-in; sRGB is default.
