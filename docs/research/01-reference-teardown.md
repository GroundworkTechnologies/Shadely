# 01 — Reference teardown: uicolors.app

Researched 2026-10-06.

**Method and limits.** I fetched the server-rendered HTML of `/`, `/generate`, `/create`, `/color-palette-generator`, `/tailwind-colors`, `/api` and read the shipped Nuxt JS bundles (string/identifier scan). I did **not** drive the live SPA in a real browser, so interaction details (animations, drag behavior, exact export modal contents) are inferred from code/strings and third-party write-ups. Items marked *(inferred)* should be verified by a manual click-through before we claim parity or superiority.

## 1. Product map

| Route | Purpose |
|---|---|
| `/` , `/generate`, `/create` | Same app: "Tailwind CSS Color Generator" workspace |
| `/color-palette-generator` | Separate generic palette tool: color schemes, lock colors, add/remove, spacebar to regenerate |
| `/tailwind-colors` | Browse every Tailwind v4 and v3 color; click-to-copy OKLCH / hex / HSL; preview in UI examples with contrast |
| `/my-palettes` | Saved palettes (requires sign-in) |
| `/api` | Paid REST API: `POST /api/v1/color-scales/tailwindcss3/generate/{hex}` with `x-api-key`, returns name + 11 shades as hex and HSL |
| External siblings | Figma plugin, Website Contrast Check (sitecontrast.com), shadcn/ui Theme Generator + themes (shadcnthemes.app), affiliate program |

Stack observed: Nuxt (Vue), PostHog analytics, Fontshare fonts (Clash Grotesk, Satoshi, Switzer), Unsplash imagery, Lemon Squeezy billing.

## 2. Generator workflow

1. Land on workspace with a pre-generated random brand palette (no empty state).
2. Tabs for scale groups: **Brand**, **Neutral**, **Status** (success/info/warning/error), plus **Fonts**.
   - Secondary/extra brand scale, custom neutral, status scales and custom fonts are **Pro-gated** (upsell copy shown inline).
3. **Random colors** (Spacebar) and **Random fonts**; "Sync Base and Heading" font toggle; default font Inter.
4. **Color harmony settings** (default "auto"): Analogous, Complementary, Split-complementary, Triadic, Tetradic, Square — used to derive the secondary scale from the brand color.
5. Input: hex or HSL (per third-party coverage); manual shade editing is possible.
6. **Save** (account) and **Share** (link).
7. Large **live preview** area with tabs: Cards, Website, Branding, Dashboard, Components, Shadcn/ui, Apps, Charts, Gradients, Logos, Headings.
8. Per-shade contrast: toggle **WCAG 2** vs **"WCAG 3 · APCA"**; shows ratio per shade against white and (inferred) black; recommends which shades to use where.
9. Copy: per-swatch hex click-to-copy; whole-scale export (formats below).

## 3. How a base color becomes 50–950

- The public API returns **hex + HSL** per stop. Sample (base `#f49d0c`): hues drift across the scale (48° at 50 → 37° at 500 → 21° at 900), saturation varies (100 → 91 → 78), lightness steps 96 → 89 → 77 → 65 → 56 → 50 → 44 → 39 → 31 → … → 14 (900's value was lost in my scrape). The base color lands exactly at stop **500**.
- So: HSL-based curve with hue shift, base pinned to 500 (this is the v3-era approach). The app UI also displays OKLCH, matching Tailwind v4 (inferred: v4 output is a conversion of the same scale, not a native OKLCH generation — verify).
- Consequence: the base color is always forced to 500 even when it is very light or very dark (e.g. yellow `#facc15` is really a ~400). This is the most common complaint pattern for this class of tool *(inferred from competitor discussions; test with extremes)*.

## 4. Export formats

Confirmed in bundle/strings: **Hexcode, HSL, OKLCH**, SVG (likely palette image), CSV/JSON references, SCSS string present, Figma plugin push. Tailwind v3 config and v4 `@theme` snippets are shown in a code block per color family *(inferred; the `ColorFamilyCode` component ships a code view)*. No evidence of DTCG / Tokens Studio JSON, CSS-variable-only output, or P3 variants.

## 5. UI / interaction patterns worth learning from

- **No blank state**: instant, good-looking default → immediate gratification.
- **Spacebar to shuffle** with a visible kbd hint; this is the single stickiest interaction.
- **Preview-first**: the palette is judged on real compositions (dashboard, landing page, charts) not only swatches.
- **Gated depth**: simple at first, advanced tabs revealed progressively.
- **Click-to-copy everywhere.**
- Design language: large display heading (Clash Grotesk), generous whitespace, rounded-xl/2xl cards, gray-50 backgrounds, social-proof quote under the controls. Header: logo, Generate, My palettes, Tailwind Colors, More (Figma plugins, Feedback), Upgrade to Pro, Sign in. Footer: product links, privacy, "Built by Erik".

## 6. Weaknesses and gaps (opportunities)

| # | Gap | Evidence |
|---|---|---|
| 1 | Core features behind account + paywall (secondary, neutral, status, fonts, save) | Inline "Unlock" copy in HTML |
| 2 | Scale generated via HSL curve, base forced to 500 | API sample, `hsl` fields |
| 3 | API license forbids competing scale-generator tools; paid | `/api` page |
| 4 | Contrast shown per shade vs white only (inferred); no full **pairing matrix** or "which shade pairs pass AA" map | JS strings reference a single `contrastRatio(background, …)` |
| 5 | No P3/wide-gamut output surfaced | no `color(display-p3` strings found |
| 6 | No DTCG / Tokens Studio / CSS-var-only / SCSS-map polish *(unverified)* | no strings |
| 7 | State not fully URL-encoded; sharing/saving tied to accounts *(inferred)* | `/my-palettes`, sign-in |
| 8 | No image/logo → palette | not present |
| 9 | No dark-mode palette mapping (inverted semantic tokens) | not present |
| 10 | No color-blindness simulation | no strings |
| 11 | Heavy page: ~230 KB HTML + many chunks, third-party fonts/analytics | measured |

## 7. What to take (logic/patterns only) and what not to

Take: instant default state, spacebar shuffle, preview-first, harmony-derived secondary, click-to-copy, contrast toggle WCAG2/APCA.
Do not take: their copy, brand, layout verbatim, fonts, imagery, the HSL curve values, or API shape.
